import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";
import { TeamMemberCard, type TeamShowcaseMember } from "@/components/team/TeamMemberCard";

const AUTO_MS = 5500;

export function TeamHomeCarousel({ members }: { members: TeamShowcaseMember[] }) {
  const { t } = useTranslation();
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  const sorted = [...members].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const count = sorted.length;

  const scrollToIndex = useCallback(
    (index: number) => {
      const el = trackRef.current;
      if (!el || count === 0) return;
      const i = ((index % count) + count) % count;
      const card = el.children[i] as HTMLElement | undefined;
      if (card) {
        const left = card.offsetLeft - (el.clientWidth - card.offsetWidth) / 2;
        el.scrollTo({ left: Math.max(0, left), behavior: "smooth" });
      }
      setActive(i);
    },
    [count]
  );

  const scrollByDir = useCallback((dir: -1 | 1) => scrollToIndex(active + dir), [active, scrollToIndex]);

  useEffect(() => {
    const el = trackRef.current;
    if (!el || count < 2) return;

    const onScroll = () => {
      const center = el.scrollLeft + el.clientWidth / 2;
      let best = 0;
      let bestDist = Infinity;
      Array.from(el.children).forEach((child, i) => {
        const c = child as HTMLElement;
        const childCenter = c.offsetLeft + c.offsetWidth / 2;
        const d = Math.abs(childCenter - center);
        if (d < bestDist) {
          bestDist = d;
          best = i;
        }
      });
      setActive(best);
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [count]);

  useEffect(() => {
    if (count < 2 || paused) return;
    const id = window.setInterval(() => scrollToIndex(active + 1), AUTO_MS);
    return () => window.clearInterval(id);
  }, [active, count, paused, scrollToIndex]);

  if (count === 0) return null;

  if (count === 1) {
    return (
      <div className="flex justify-center">
        <TeamMemberCard member={sorted[0]!} />
      </div>
    );
  }

  return (
    <div
      className="group/carousel relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <button
        type="button"
        onClick={() => scrollByDir(-1)}
        className="absolute left-0 top-1/2 z-20 hidden -translate-y-1/2 rounded-full border border-slate-200 bg-white/95 p-3 text-[color:var(--color-gt-navy)] shadow-lg transition hover:bg-white hover:shadow-xl md:flex"
        aria-label={t("home.teamCarouselPrev")}
      >
        <IoChevronBack className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={() => scrollByDir(1)}
        className="absolute right-0 top-1/2 z-20 hidden -translate-y-1/2 rounded-full border border-slate-200 bg-white/95 p-3 text-[color:var(--color-gt-navy)] shadow-lg transition hover:bg-white hover:shadow-xl md:flex"
        aria-label={t("home.teamCarouselNext")}
      >
        <IoChevronForward className="h-5 w-5" />
      </button>

      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-slate-50 to-transparent md:w-14" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-slate-50 to-transparent md:w-14" />

      <div
        ref={trackRef}
        className="flex gap-5 overflow-x-auto scroll-smooth px-1 pb-2 pt-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden snap-x snap-mandatory"
      >
        {sorted.map((member) => (
          <TeamMemberCard key={member._id} member={member} snap />
        ))}
      </div>

      <div className="mt-6 flex items-center justify-center gap-2">
        {sorted.map((m, i) => (
          <button
            key={m._id}
            type="button"
            onClick={() => scrollToIndex(i)}
            className={`h-2 rounded-full transition-all ${
              i === active
                ? "w-8 bg-[color:var(--color-gt-accent-green)]"
                : "w-2 bg-slate-300 hover:bg-slate-400"
            }`}
            aria-label={`${t("home.teamCarouselGoTo")} ${i + 1}`}
            aria-current={i === active ? "true" : undefined}
          />
        ))}
      </div>

      <p className="mt-3 text-center text-xs text-slate-500 md:hidden">
        {t("home.teamCarouselSwipe")}
      </p>
    </div>
  );
}

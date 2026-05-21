import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { FaEnvelope, FaUserTie, FaWhatsapp } from "react-icons/fa";
import { IoChevronBack, IoChevronDown, IoChevronForward, IoChevronUp } from "react-icons/io5";
import { buildWhatsAppUrl, digitsFromPhoneDisplay } from "@/lib/contactReply";
import type { TeamShowcaseMember } from "@/components/team/TeamEnterpriseShowcase";

const AUTO_MS = 5500;

function ContactAction({
  icon: Icon,
  label,
  href,
  variant,
}: {
  icon: typeof FaWhatsapp;
  label: string;
  href: string;
  variant: "whatsapp" | "email";
}) {
  const isWa = variant === "whatsapp";
  return (
    <a
      href={href}
      target={isWa ? "_blank" : undefined}
      rel={isWa ? "noopener noreferrer" : undefined}
      className="group/action flex items-center gap-3 rounded-xl py-1 transition hover:opacity-90"
      onClick={(e) => e.stopPropagation()}
    >
      <span
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full shadow-sm transition group-hover/action:scale-105 ${
          isWa ? "bg-[#25D366] text-white" : "bg-[color:var(--color-gt-navy)] text-white"
        }`}
      >
        <Icon className="h-4 w-4" aria-hidden />
      </span>
      <span
        className={`min-w-0 text-sm font-semibold leading-snug ${
          isWa ? "text-emerald-800" : "text-[color:var(--color-gt-blue)]"
        } break-all group-hover/action:underline`}
        dir="ltr"
      >
        {label}
      </span>
    </a>
  );
}

export function TeamHomeProCard({ member }: { member: TeamShowcaseMember }) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);

  const role = member.title?.trim() ?? "";
  const name = member.name?.trim() || "—";
  const phone = member.phone?.trim() ?? "";
  const email = member.email?.trim() ?? "";
  const description = member.description?.trim() ?? "";
  const waDigits = phone ? digitsFromPhoneDisplay(phone) : null;
  const longDesc = description.length > 140;

  return (
    <article
      className="flex h-full w-[min(100%,360px)] shrink-0 snap-center flex-col overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200/90 transition duration-300 hover:shadow-[0_20px_50px_rgba(10,22,40,0.12)] hover:ring-slate-300 sm:w-[360px]"
      style={{ scrollSnapAlign: "center" }}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
        {member.imageUrl ? (
          <img
            src={member.imageUrl}
            alt={name}
            className="h-full w-full object-cover object-[center_15%]"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full min-h-[200px] items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
            <FaUserTie className="h-16 w-16 text-slate-300" aria-hidden />
          </div>
        )}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[color:var(--color-gt-navy)]/35 to-transparent" />
      </div>

      <div className="flex flex-1 flex-col p-5">
        {role ? (
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[color:var(--color-gt-accent-green)]">
            {role}
          </p>
        ) : null}
        <h3 className="mt-1 font-[family-name:var(--font-display)] text-xl font-bold leading-tight text-[color:var(--color-gt-navy)] sm:text-2xl">
          {name}
        </h3>

        <div className="mt-3 space-y-2.5 border-t border-slate-100 pt-3">
          {waDigits && phone ? (
            <ContactAction
              icon={FaWhatsapp}
              label={phone}
              href={buildWhatsAppUrl(waDigits)}
              variant="whatsapp"
            />
          ) : (
            <p className="text-xs text-slate-400">{t("home.teamNoPhone")}</p>
          )}
          {email ? (
            <ContactAction icon={FaEnvelope} label={email} href={`mailto:${email}`} variant="email" />
          ) : (
            <p className="text-xs text-slate-400">{t("home.teamNoEmail")}</p>
          )}
        </div>

        {description ? (
          <div className="mt-3 border-t border-slate-100 pt-3">
            <p className={`text-sm leading-relaxed text-slate-600 ${longDesc && !expanded ? "line-clamp-3" : ""}`}>
              {description}
            </p>
            {longDesc && (
              <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[color:var(--color-gt-blue)] hover:underline"
              >
                {expanded ? (
                  <>
                    <IoChevronUp className="h-3.5 w-3.5" />
                    {t("about.readLess")}
                  </>
                ) : (
                  <>
                    <IoChevronDown className="h-3.5 w-3.5" />
                    {t("about.readMore")}
                  </>
                )}
              </button>
            )}
          </div>
        ) : null}
      </div>
    </article>
  );
}

export function TeamHomeCarousel({ members }: { members: TeamShowcaseMember[] }) {
  const { t } = useTranslation();
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  const sorted = [...members].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const count = sorted.length;

  const scrollToIndex = useCallback((index: number) => {
    const el = trackRef.current;
    if (!el || count === 0) return;
    const i = ((index % count) + count) % count;
    const card = el.children[i] as HTMLElement | undefined;
    if (card) {
      const left = card.offsetLeft - (el.clientWidth - card.offsetWidth) / 2;
      el.scrollTo({ left: Math.max(0, left), behavior: "smooth" });
    }
    setActive(i);
  }, [count]);

  const scrollByDir = useCallback(
    (dir: -1 | 1) => scrollToIndex(active + dir),
    [active, scrollToIndex]
  );

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
      <div className="mx-auto max-w-[360px]">
        <TeamHomeProCard member={sorted[0]!} />
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
          <TeamHomeProCard key={member._id} member={member} />
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

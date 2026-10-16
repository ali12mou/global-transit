import { useState } from "react";
import { useTranslation } from "react-i18next";

type LogoProps = {
  /** header: barre claire · footer: fond bleu · admin: barre latérale sombre · onDark: page de connexion */
  variant?: "header" | "footer" | "admin" | "onDark";
  className?: string;
};

/** Logo officiel (globe, anneau doré, « G » et navire) — détouré, voir public/brand/. */
const MARK_SOURCES = ["/brand/gt-logo-sm.webp", "/brand/gt-logo-sm.png", "/logo-mark.png"] as const;

export function Logo({ variant = "header", className = "" }: LogoProps) {
  const { t } = useTranslation();
  const [markIndex, setMarkIndex] = useState(0);
  const markSrc = MARK_SOURCES[Math.min(markIndex, MARK_SOURCES.length - 1)]!;
  const dark = variant !== "header";

  const markSize =
    variant === "footer"
      ? "h-16 sm:h-[72px]"
      : variant === "admin"
        ? "h-10"
        : variant === "onDark"
          ? "h-14 sm:h-16"
          : "h-12 sm:h-[52px] md:h-14";

  const wordSize =
    variant === "admin" ? "text-[0.8rem]" : variant === "footer" ? "text-lg" : "text-[0.95rem] sm:text-[1.05rem]";

  const line2Size =
    variant === "admin"
      ? "text-[0.56rem] tracking-[0.16em]"
      : "text-[0.62rem] sm:text-[0.68rem] tracking-[0.18em]";

  const mark = (
    <img
      src={markSrc}
      alt=""
      width={200}
      height={188}
      onError={() => setMarkIndex((i) => Math.min(i + 1, MARK_SOURCES.length - 1))}
      className={`${markSize} w-auto shrink-0 object-contain transition-transform duration-500 group-hover:rotate-[-4deg] group-hover:scale-105`}
      loading="eager"
      decoding="async"
      {...(variant === "header" ? { fetchPriority: "high" as const } : {})}
    />
  );

  return (
    <div className={`group inline-flex max-w-full shrink-0 items-center gap-2.5 sm:gap-3 ${className}`.trim()}>
      {dark ? (
        // Pastille claire : le « G » bleu du logo reste lisible sur les fonds bleus
        <span
          className="relative inline-flex shrink-0 items-center justify-center rounded-2xl bg-[radial-gradient(circle_at_50%_45%,#ffffff_0%,#eef4ff_60%,#d9e6ff_100%)] p-1.5 shadow-[0_8px_24px_-8px_rgba(1,11,44,0.55)] ring-1 ring-white/40"
          aria-hidden
        >
          {mark}
        </span>
      ) : (
        <span className="inline-flex shrink-0 items-center" aria-hidden>
          {mark}
        </span>
      )}
      <div className="min-w-0 leading-none">
        <span
          className={`block font-[family-name:var(--font-display)] font-bold leading-tight tracking-tight ${wordSize} ${
            dark ? "text-white" : "text-[color:var(--color-gt-brand-blue)]"
          }`}
        >
          {t("brand.line1")}
        </span>
        <span
          className={`mt-1 block font-semibold uppercase ${line2Size} ${
            dark ? "text-[color:var(--color-gt-gold-bright)]" : "text-[color:var(--color-gt-gold)]"
          }`}
        >
          {t("brand.line2")}
        </span>
      </div>
    </div>
  );
}

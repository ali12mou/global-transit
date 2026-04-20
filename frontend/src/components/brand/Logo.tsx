import { useState } from "react";
import { useTranslation } from "react-i18next";

type LogoProps = {
  /** header: barre claire · footer: fond sombre · admin: barre latérale compacte */
  variant?: "header" | "footer" | "admin";
  className?: string;
};

/**
 * Blason (`/logo-mark.png`) + nom distinct « Global Transit » / « Transport & Service ».
 * Le fichier mark doit idéalement être l’emblème seul ; en secours : `/logo.svg`.
 */
export function Logo({ variant = "header", className = "" }: LogoProps) {
  const { t } = useTranslation();
  const [markSrc, setMarkSrc] = useState("/logo-mark.png");

  const line1Class =
    variant === "footer" || variant === "admin"
      ? "text-white"
      : "text-[color:var(--color-gt-blue)]";

  const line2Class =
    variant === "footer"
      ? "text-amber-300/95"
      : variant === "admin"
        ? "text-amber-200/90"
        : "text-[color:var(--color-gt-gold)]";

  const markSize =
    variant === "footer"
      ? "h-14 w-auto max-w-[100px] sm:h-16 sm:max-w-[110px]"
      : variant === "admin"
        ? "h-9 w-auto max-w-[72px]"
        : "h-11 w-auto max-w-[92px] sm:h-12 sm:max-w-[100px] md:h-[52px] md:max-w-[108px]";

  const wordSize =
    variant === "admin"
      ? "text-[0.7rem] sm:text-[0.75rem]"
      : "text-[0.95rem] sm:text-base";

  const line2Size =
    variant === "admin"
      ? "text-[0.55rem] sm:text-[0.6rem] tracking-[0.12em]"
      : "text-[0.65rem] sm:text-[0.7rem] tracking-[0.14em]";

  const mark = (
    <img
      src={markSrc}
      alt=""
      width={160}
      height={64}
      onError={() => setMarkSrc("/logo.svg")}
      className={`${markSize} shrink-0 object-contain object-left`}
      loading="eager"
      decoding="async"
      {...(variant === "header" ? { fetchPriority: "high" as const } : {})}
    />
  );

  const wordmark = (
    <div className="min-w-0 leading-none">
      <span
        className={`block font-semibold leading-tight tracking-tight ${wordSize} ${line1Class}`}
      >
        {t("brand.line1")}
      </span>
      <span
        className={`mt-1 block font-semibold uppercase ${line2Size} ${line2Class}`}
      >
        {t("brand.line2")}
      </span>
    </div>
  );

  if (variant === "footer") {
    return (
      <div className={`inline-flex max-w-full flex-col gap-3 ${className}`.trim()}>
        <div className="inline-flex w-fit rounded-xl bg-white p-3 shadow-md ring-1 ring-white/25">{mark}</div>
        {wordmark}
      </div>
    );
  }

  if (variant === "admin") {
    return (
      <div
        className={`inline-flex max-w-full items-center gap-2 rounded-lg bg-white/10 p-2 ring-1 ring-white/15 ${className}`.trim()}
      >
        <div className="rounded-md bg-white p-1.5 shadow-inner">{mark}</div>
        {wordmark}
      </div>
    );
  }

  return (
    <div
      className={`inline-flex max-w-[min(100%,380px)] shrink-0 items-center gap-2 sm:gap-3 ${className}`.trim()}
    >
      <span className="inline-flex shrink-0 items-center" aria-hidden>
        {mark}
      </span>
      {wordmark}
    </div>
  );
}

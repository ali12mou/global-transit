import { FaCheck } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import type { AboutConfig } from "@/lib/aboutConfig";

type Props = {
  about: AboutConfig;
  items: string[];
};

export function AboutStrengthsSection({ about, items }: Props) {
  const { t } = useTranslation();

  const kicker = about.strengthsKicker?.trim() || t("about.strengthsKicker");
  const title = about.strengthsTitle?.trim() || t("about.strengthsTitle");
  const badge = about.standardsBadge?.trim() || t("about.standardsBadge");
  const intro = about.strengthsIntro?.trim() || t("about.strengthsIntro");
  const tagline = about.strengthsTagline?.trim() || t("about.strengthsTagline");

  return (
    <article
      id="atouts"
      className="scroll-mt-24 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
    >
      <div className="gt-brand-blue-bg px-5 py-8 text-center sm:px-8 md:py-10">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/80">{kicker}</p>
        <div className="mt-3 flex flex-wrap items-center justify-center gap-3">
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-white md:text-3xl">
            {title}
          </h2>
          {badge ? (
            <span className="rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
              {badge}
            </span>
          ) : null}
        </div>
      </div>

      <div className="grid gap-8 bg-white px-5 py-8 sm:px-8 md:py-10 lg:grid-cols-2 lg:items-start lg:gap-12">
        <div className="lg:sticky lg:top-28">
          <p className="text-base leading-[1.75] text-slate-700 md:text-[17px]">{intro}</p>
          <p className="mt-4 text-sm font-medium italic text-[color:var(--color-gt-brand-blue)]">
            {tagline}
          </p>
        </div>

        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-5">
          {items.map((label, idx) => (
            <li key={`${label}-${idx}`} className="flex min-h-[3rem] items-start gap-3 sm:min-h-[3.25rem]">
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[color:var(--color-gt-brand-blue)] text-white shadow-sm ring-4 ring-[color:var(--color-gt-brand-blue)]/15"
                aria-hidden
              >
                <FaCheck className="h-3.5 w-3.5" />
              </span>
              <span className="pt-1.5 text-sm font-medium leading-snug text-slate-800 sm:text-[15px]">
                {label}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}

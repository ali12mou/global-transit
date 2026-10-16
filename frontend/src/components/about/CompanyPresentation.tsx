import { useTranslation } from "react-i18next";
import type { IconType } from "react-icons";
import {
  IoBriefcaseOutline,
  IoBusinessOutline,
  IoCalendarOutline,
  IoGlobeOutline,
  IoGitNetworkOutline,
  IoPeopleOutline,
  IoRibbonOutline,
} from "react-icons/io5";
import { COMPANY_FOUNDED_YEAR, yearsOfExperience } from "@/lib/companyYears";

/** Présentation de l'entreprise : résumé + fiche d'identité (années d'expérience calculées automatiquement). */
export function CompanyPresentation() {
  const { t } = useTranslation();
  const years = yearsOfExperience();

  const facts: { Icon: IconType; label: string; value: string }[] = [
    { Icon: IoBusinessOutline, label: t("about.pres.hq"), value: t("about.pres.hqValue") },
    { Icon: IoCalendarOutline, label: t("about.pres.founded"), value: String(COMPANY_FOUNDED_YEAR) },
    { Icon: IoRibbonOutline, label: t("about.pres.experience"), value: t("about.experienceYears", { years }) },
    { Icon: IoBriefcaseOutline, label: t("about.pres.trades"), value: t("about.pres.tradesValue") },
    { Icon: IoGlobeOutline, label: t("about.pres.area"), value: t("about.pres.areaValue") },
    { Icon: IoGitNetworkOutline, label: t("about.pres.corridor"), value: t("about.pres.corridorValue") },
    { Icon: IoPeopleOutline, label: t("about.pres.clients"), value: t("about.pres.clientsValue") },
  ];

  return (
    <section id="presentation" className="mx-auto max-w-7xl scroll-mt-24 px-4 pb-12 sm:px-6 lg:px-8">
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_8px_30px_rgba(10,22,40,0.06)]">
        <div className="grid lg:grid-cols-[1.3fr_1fr]">
          <div className="p-6 md:p-10">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-[color:var(--color-gt-gold)]">{t("about.pres.kicker")}</p>
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-2xl font-bold leading-tight text-[color:var(--color-gt-navy)] md:text-3xl">
              {t("about.pres.title")}
            </h2>
            <div className="mt-6 space-y-4 text-base leading-relaxed text-slate-600">
              <p>{t("about.pres.p1")}</p>
              <p>{t("about.pres.p2", { year: COMPANY_FOUNDED_YEAR })}</p>
              <p className="border-l-4 border-[color:var(--color-gt-gold-bright)] bg-amber-50/60 py-3 pl-4 pr-3 font-medium text-[color:var(--color-gt-navy)]">
                {t("about.pres.p3")}
              </p>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-4 sm:max-w-md">
              <div className="rounded-2xl bg-[#eef3fc] p-4">
                <p className="font-[family-name:var(--font-display)] text-4xl font-bold leading-none text-[color:var(--color-gt-brand-blue)]">{years}</p>
                <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-slate-500">{t("home.yearsExperience")}</p>
              </div>
              <div className="rounded-2xl bg-[#eef3fc] p-4">
                <p className="font-[family-name:var(--font-display)] text-4xl font-bold leading-none text-[color:var(--color-gt-brand-blue)]">{COMPANY_FOUNDED_YEAR}</p>
                <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-slate-500">{t("about.pres.founded")}</p>
              </div>
            </div>
          </div>

          <aside className="relative bg-[linear-gradient(160deg,#04307f_0%,#021a55_60%,#010f3a_100%)] p-6 text-white md:p-10">
            <div className="gt-gold-gradient absolute inset-x-0 top-0 h-1 lg:inset-y-0 lg:left-0 lg:right-auto lg:h-auto lg:w-1" aria-hidden />
            <h3 className="font-[family-name:var(--font-display)] text-xl font-semibold">{t("about.pres.factsTitle")}</h3>
            <dl className="mt-6 space-y-4">
              {facts.map(({ Icon, label, value }) => (
                <div key={label} className="flex gap-3.5 border-b border-white/10 pb-4 last:border-0 last:pb-0">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[color:var(--color-gt-gold-bright)]/15 text-[color:var(--color-gt-gold-bright)]">
                    <Icon className="h-[18px] w-[18px]" aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <dt className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/55">{label}</dt>
                    <dd className="mt-0.5 text-sm font-medium leading-snug text-white">{value}</dd>
                  </div>
                </div>
              ))}
            </dl>
          </aside>
        </div>
      </div>
    </section>
  );
}

import { FaCheck } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  IoChatbubblesOutline,
  IoDocumentTextOutline,
  IoPeopleOutline,
  IoStatsChartOutline,
  IoRibbonOutline,
} from "react-icons/io5";
import { Logo } from "@/components/brand/Logo";

const strengthIcons = [
  IoChatbubblesOutline,
  IoPeopleOutline,
  IoStatsChartOutline,
  IoRibbonOutline,
  IoDocumentTextOutline,
] as const;

const strengthKeys = [
  "strengthCommunication",
  "strengthTeamwork",
  "strengthReporting",
  "strengthResponsibility",
  "strengthFinalReport",
] as const;

const serviceCardKeys = [
  { title: "svcLogisticsTitle", text: "svcLogisticsText" },
  { title: "svcTransitTitle", text: "svcTransitText" },
  { title: "svcClearanceTitle", text: "svcClearanceText" },
  { title: "svcCustomsTitle", text: "svcCustomsText" },
  { title: "svcDocsTitle", text: "svcDocsText" },
] as const;

export function AboutPage() {
  const { t } = useTranslation();

  return (
    <div className="bg-white">
      <section className="border-b border-slate-100 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 md:py-20">
          <div className="grid gap-12 lg:grid-cols-12 lg:items-start">
            <div className="lg:col-span-7">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[color:var(--color-gt-accent-green)]">
                {t("about.kicker")}
              </p>
              <h1 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-bold leading-tight text-[color:var(--color-gt-navy)] md:text-4xl lg:text-[2.65rem]">
                {t("about.title")}
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-relaxed text-slate-600 md:text-lg">{t("about.intro")}</p>
            </div>
            <div className="lg:col-span-5">
              <div className="rounded-2xl border border-slate-200/90 bg-slate-50/50 p-6 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="shrink-0 rounded-xl bg-white p-2 shadow-sm ring-1 ring-slate-200/80">
                    <Logo variant="header" className="max-w-[240px] sm:max-w-[260px]" />
                  </div>
                  <div>
                    <p className="font-semibold text-[color:var(--color-gt-navy)]">{t("about.cardTitle")}</p>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">{t("about.cardText")}</p>
                  </div>
                </div>
                <div className="mt-5 flex items-start gap-2 border-t border-slate-200/80 pt-5">
                  <FaCheck className="mt-0.5 shrink-0 text-[color:var(--color-gt-accent-green)]" />
                  <p className="text-sm text-slate-600">{t("about.cardCheck")}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 md:py-16">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="space-y-10 lg:col-span-8">
            <div>
              <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-[color:var(--color-gt-navy)] md:text-3xl">
                {t("about.missionH2")}
              </h2>
              <div className="mt-4 space-y-4 text-slate-600 leading-relaxed">
                <p>{t("about.missionP1")}</p>
                <p>{t("about.missionP2")}</p>
              </div>

              <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_1px_3px_rgba(15,23,42,0.06)]">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold text-[color:var(--color-gt-navy)]">
                    {t("about.strengthsTitle")}
                  </h3>
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-800 ring-1 ring-emerald-100">
                    {t("about.standardsBadge")}
                  </span>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {strengthKeys.map((key, idx) => {
                    const Icon = strengthIcons[idx]!;
                    return (
                      <div
                        key={key}
                        className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/60 px-4 py-3"
                      >
                        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-[color:var(--color-gt-accent-green)] shadow-sm ring-1 ring-slate-100">
                          <Icon className="h-5 w-5" aria-hidden />
                        </span>
                        <span className="text-sm font-medium text-slate-800">{t(`about.${key}`)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div>
              <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-[color:var(--color-gt-navy)] md:text-3xl">
                {t("about.servicesH2")}
              </h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {serviceCardKeys.map((s) => (
                  <div
                    key={s.title}
                    className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm transition hover:border-slate-300/90 hover:shadow-md"
                  >
                    <div className="mb-3 h-1 w-10 rounded-full bg-[color:var(--color-gt-accent-green)]/80" />
                    <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold text-[color:var(--color-gt-navy)]">
                      {t(`about.${s.title}`)}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">{t(`about.${s.text}`)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <aside className="space-y-6 lg:col-span-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{t("about.experienceKicker")}</p>
              <p className="mt-2 font-[family-name:var(--font-display)] text-4xl font-bold text-[color:var(--color-gt-navy)]">
                {t("about.experienceYears")}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">{t("about.experienceText")}</p>
              <ul className="mt-6 space-y-2">
                {strengthKeys.map((key) => (
                  <li
                    key={key}
                    className="rounded-lg border border-slate-100 bg-slate-50/80 px-3 py-2 text-sm text-slate-700"
                  >
                    {t(`about.${key}`)}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-6">
              <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold text-[color:var(--color-gt-navy)]">
                {t("about.asideMissionH3")}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">{t("about.asideMissionText")}</p>
              <Link
                to="/contact"
                className="mt-5 inline-flex text-sm font-semibold text-[color:var(--color-gt-blue)] hover:underline"
              >
                {t("about.contactCta")}
              </Link>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}

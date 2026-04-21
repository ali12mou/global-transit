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
    <div className="bg-slate-50/60">
      <section className="border-b border-slate-200/80 bg-gradient-to-b from-white to-slate-50/70">
        <div className="mx-auto w-full max-w-[1440px] px-4 py-12 sm:px-6 md:py-16 lg:px-8 xl:px-10 2xl:py-20">
          <div className="grid gap-8 lg:grid-cols-12 lg:items-start xl:gap-12">
            <div className="lg:col-span-7 xl:col-span-8">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[color:var(--color-gt-accent-green)]">
                {t("about.kicker")}
              </p>
              <h1 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-bold leading-tight text-[color:var(--color-gt-navy)] md:text-4xl lg:text-[2.65rem]">
                {t("about.title")}
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-relaxed text-slate-600 md:text-lg">{t("about.intro")}</p>
            </div>
            <div className="lg:col-span-5 xl:col-span-4">
              <div className="rounded-3xl border border-slate-200/90 bg-white/90 p-5 shadow-[0_10px_28px_rgba(15,23,42,0.07)] sm:p-6 lg:sticky lg:top-24">
                <div className="flex flex-col items-start gap-4 sm:flex-row">
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

      <section className="mx-auto w-full max-w-[1440px] px-4 py-12 sm:px-6 md:py-14 lg:px-8 xl:px-10 2xl:py-16">
        <div className="grid gap-8 xl:grid-cols-12 xl:gap-10">
          <div className="space-y-8 xl:col-span-8 2xl:col-span-9">
            <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.05)] sm:p-6 lg:p-8">
              <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-[color:var(--color-gt-navy)] md:text-3xl">
                {t("about.missionH2")}
              </h2>
              <div className="mt-4 space-y-4 text-slate-600 leading-relaxed">
                <p>{t("about.missionP1")}</p>
                <p>{t("about.missionP2")}</p>
              </div>

              <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50/60 p-4 sm:p-5">
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

            <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.05)] sm:p-6 lg:p-8">
              <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-[color:var(--color-gt-navy)] md:text-3xl">
                {t("about.servicesH2")}
              </h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
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

            <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.05)] sm:p-6 lg:p-8">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-[color:var(--color-gt-navy)] md:text-3xl">
                  {t("about.expertsH2")}
                </h2>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-600">
                  {t("about.expertsBadge")}
                </span>
              </div>

              <div className="grid gap-6">
                <article className="overflow-hidden rounded-3xl border border-[color:var(--color-gt-navy)]/20 bg-gradient-to-br from-white via-slate-50 to-slate-100 shadow-[0_12px_30px_rgba(15,23,42,0.08)]">
                  <div className="grid md:grid-cols-[320px_1fr]">
                    <div className="relative h-[28rem] md:h-full">
                      <img
                        src="/images/team/ibrahim-mouse.png"
                        alt={t("about.ibrahimName")}
                        className="h-full w-full object-cover object-top"
                        loading="lazy"
                      />
                      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-slate-900/45 to-transparent" />
                    </div>

                    <div className="p-6 md:p-8">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--color-gt-accent-green)]">
                        {t("about.ibrahimRole")}
                      </p>
                      <h3 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-bold text-[color:var(--color-gt-navy)]">
                        {t("about.ibrahimName")}
                      </h3>
                      <p className="mt-1 text-sm font-medium text-slate-600">{t("about.ibrahimTitle")}</p>

                      <div className="mt-5 space-y-4 text-sm leading-relaxed text-slate-700 md:text-base">
                        <p>{t("about.ibrahimMessageP1")}</p>
                        <p>{t("about.ibrahimMessageP2")}</p>
                        <p>{t("about.ibrahimMessageP3")}</p>
                        <p>{t("about.ibrahimMessageP4")}</p>
                      </div>

                      <div className="mt-6 border-t border-slate-200 pt-4">
                        <p className="text-sm font-semibold text-[color:var(--color-gt-navy)]">{t("about.ibrahimSignName")}</p>
                        <p className="text-xs uppercase tracking-wider text-slate-500">{t("about.ibrahimSignRole")}</p>
                      </div>
                    </div>
                  </div>
                </article>

                <div className="grid gap-5 sm:grid-cols-2 2xl:grid-cols-3">
                  <article className="group overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-[0_6px_20px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_28px_rgba(15,23,42,0.12)]">
                    <div className="relative aspect-[3/4] max-h-[430px] min-h-[320px]">
                      <img
                        src="/images/team/aboubaker-helaf.png"
                        alt={t("about.aboubakerName")}
                        className="h-full w-full object-cover object-top"
                        loading="lazy"
                      />
                      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-900/45 to-transparent" />
                    </div>

                    <div className="p-6">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--color-gt-accent-green)]">
                        {t("about.aboubakerRole")}
                      </p>
                      <h3 className="mt-2 font-[family-name:var(--font-display)] text-xl font-bold text-[color:var(--color-gt-navy)]">
                        {t("about.aboubakerName")}
                      </h3>
                      <p className="mt-3 text-sm leading-relaxed text-slate-600">{t("about.aboubakerBio")}</p>
                    </div>
                  </article>

                  <article className="group overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-[0_6px_20px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_28px_rgba(15,23,42,0.12)]">
                    <div className="relative aspect-[3/4] max-h-[430px] min-h-[320px]">
                      <img
                        src="/images/team/moustafe-warsama-omar.png"
                        alt={t("about.moustafeName")}
                        className="h-full w-full object-cover object-top"
                        loading="lazy"
                      />
                      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-900/45 to-transparent" />
                    </div>

                    <div className="p-6">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--color-gt-accent-green)]">
                        {t("about.moustafeRole")}
                      </p>
                      <h3 className="mt-2 font-[family-name:var(--font-display)] text-xl font-bold text-[color:var(--color-gt-navy)]">
                        {t("about.moustafeName")}
                      </h3>
                      <p className="mt-3 text-sm leading-relaxed text-slate-600">{t("about.moustafeBio")}</p>
                    </div>
                  </article>

                  <article className="group overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-[0_6px_20px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_28px_rgba(15,23,42,0.12)]">
                    <div className="relative aspect-[3/4] max-h-[430px] min-h-[320px]">
                      <img
                        src="/images/team/yousouf-haroun.png"
                        alt={t("about.yousoufName")}
                        className="h-full w-full object-cover object-top"
                        loading="lazy"
                      />
                      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-900/45 to-transparent" />
                    </div>

                    <div className="p-6">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--color-gt-accent-green)]">
                        {t("about.yousoufRole")}
                      </p>
                      <h3 className="mt-2 font-[family-name:var(--font-display)] text-xl font-bold text-[color:var(--color-gt-navy)]">
                        {t("about.yousoufName")}
                      </h3>
                      <p className="mt-3 text-sm leading-relaxed text-slate-600">{t("about.yousoufBio")}</p>
                    </div>
                  </article>
                </div>
              </div>
            </div>
          </div>

          <aside className="space-y-6 xl:col-span-4 2xl:col-span-3">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm xl:sticky xl:top-24">
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

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
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

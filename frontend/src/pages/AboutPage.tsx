import { FaCheck, FaArrowRight } from "react-icons/fa";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { Logo } from "@/components/brand/Logo";
import { AboutStrengthsSection } from "@/components/about/AboutStrengthsSection";
import { AboutSectionHeader } from "@/components/about/AboutSectionHeader";
import { apiFetch } from "@/api/client";
import { parseAboutConfig } from "@/lib/aboutConfig";
import { CompanyHighlights, QuoteBanner } from "@/components/home/CompanyHighlights";
import { CompanyPresentation } from "@/components/about/CompanyPresentation";
import { COMPANY_FOUNDED_YEAR, yearsOfExperience } from "@/lib/companyYears";

const strengthKeys = [
  "strengthCommunication",
  "strengthTeamwork",
  "strengthResponsibility",
] as const;

function isRemovedStrength(label: string): boolean {
  const n = label.trim().toLowerCase();
  return n.includes("reporting") || n.includes("rapport final") || n.includes("final report");
}

const serviceCardKeys = [
  { title: "svcLogisticsTitle", text: "svcLogisticsText" },
  { title: "svcTransitTitle", text: "svcTransitText" },
  { title: "svcClearanceTitle", text: "svcClearanceText" },
  { title: "svcCustomsTitle", text: "svcCustomsText" },
  { title: "svcDocsTitle", text: "svcDocsText" },
] as const;

const SECTION_LINKS = [
  { id: "presentation", labelKey: "about.pres.kicker" },
  { id: "mission", labelKey: "about.navMission" },
  { id: "atouts", labelKey: "about.navStrengths" },
  { id: "services", labelKey: "about.navServices" },
] as const;

export function AboutPage() {
  const { t, i18n } = useTranslation();
  /** Les textes saisis dans l'admin sont en français : dans les autres langues, on affiche les traductions. */
  const useFrenchCms = i18n.resolvedLanguage?.startsWith("fr") ?? false;
  const { hash } = useLocation();
  const navigate = useNavigate();

  const { data: cfgRaw } = useQuery({
    queryKey: ["public-config"],
    queryFn: () => apiFetch<Record<string, unknown>>("/api/config", { auth: false }),
  });

  const about = parseAboutConfig(useFrenchCms ? cfgRaw?.about : undefined);

  const strengths = about.strengths?.length
    ? about.strengths.filter((s) => !isRemovedStrength(s))
    : strengthKeys.map((key) => t(`about.${key}`));

  const serviceCards = about.services?.length
    ? about.services.map((s) => ({ title: s.title ?? "", text: s.text ?? "" }))
    : serviceCardKeys.map((s) => ({
        title: t(`about.${s.title}`),
        text: t(`about.${s.text}`),
      }));

  useEffect(() => {
    if (hash === "#equipe") navigate("/equipe", { replace: true });
  }, [hash, navigate]);

  return (
    <div className="min-h-screen w-full bg-slate-50">
      {/* Hero */}
      <section className="relative w-full overflow-hidden bg-[color:var(--color-gt-navy)] text-white">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/images/hero/hero-4.png')" }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(105deg,rgba(4,10,20,0.92)_0%,rgba(4,10,20,0.82)_50%,rgba(4,10,20,0.72)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,197,94,0.18),transparent_50%),radial-gradient(circle_at_10%_85%,rgba(56,189,248,0.12),transparent_45%)]" />

        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-24 lg:px-8">
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-[color:var(--color-gt-gold-bright)]">
            {about.kicker ?? t("about.kicker")}
          </p>
          <h1 className="mt-4 max-w-4xl font-[family-name:var(--font-display)] text-3xl font-bold leading-[1.15] md:text-5xl lg:text-[3.25rem]">
            {about.title ?? t("about.title")}
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-slate-200 md:text-lg">
            {about.intro ?? t("about.intro")}
          </p>

          <nav
            className="mt-10 flex flex-wrap gap-2"
            aria-label={t("about.navSections")}
          >
            {SECTION_LINKS.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold text-white backdrop-blur-sm transition hover:border-white/40 hover:bg-white/20"
              >
                {t(item.labelKey)}
              </a>
            ))}
          </nav>
        </div>
      </section>

      {/* Présentation + expérience */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 md:py-16 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-12">
          <article className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_8px_30px_rgba(10,22,40,0.06)] lg:col-span-8 lg:p-8">
            <div className="absolute right-0 top-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-[color:var(--color-gt-accent-green)]/5" />
            <div className="relative flex flex-col items-start gap-6 md:flex-row md:items-center">
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 shadow-inner">
                <Logo variant="header" className="max-w-[240px]" />
              </div>
              <div className="flex-1">
                <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-[color:var(--color-gt-navy)] md:text-3xl">
                  {about.cardTitle ?? t("about.cardTitle")}
                </h2>
                <p className="mt-3 text-base leading-relaxed text-slate-600">
                  {about.cardText ?? t("about.cardText")}
                </p>
              </div>
            </div>
            <div className="relative mt-6 inline-flex items-start gap-3 rounded-2xl bg-gradient-to-r from-emerald-50 to-emerald-50/40 px-5 py-4 text-sm text-emerald-900 ring-1 ring-emerald-100">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white shadow-sm">
                <FaCheck className="h-3.5 w-3.5" />
              </span>
              <span className="leading-relaxed">{about.cardCheck ?? t("about.cardCheck")}</span>
            </div>
          </article>

          <aside className="relative overflow-hidden rounded-3xl border border-[color:var(--color-gt-blue)]/20 bg-gradient-to-br from-[color:var(--color-gt-navy)] to-[#0a1628] p-6 text-white shadow-lg lg:col-span-4 lg:p-8">
            <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-[color:var(--color-gt-accent-green)]/20 blur-2xl" />
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[color:var(--color-gt-gold-bright)]">
              {about.experienceKicker ?? t("about.experienceKicker")}
            </p>
            {/* Calculé automatiquement depuis l'année de création (+1 chaque année) */}
            <p className="mt-3 font-[family-name:var(--font-display)] text-6xl font-bold leading-none">
              {t("about.experienceYears", { years: yearsOfExperience() })}
            </p>
            <p className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/60">
              {t("about.pres.founded")} · {COMPANY_FOUNDED_YEAR}
            </p>
            <p className="mt-4 text-sm leading-relaxed text-slate-300">
              {t("about.experienceText", { years: yearsOfExperience() })}
            </p>
          </aside>
        </div>
      </section>

      <CompanyPresentation />

      {/* Contenu principal */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
          <div className="space-y-8 lg:col-span-8">
            {/* Mission */}
            <article
              id="mission"
              className="scroll-mt-24 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8"
            >
              <AboutSectionHeader title={about.missionH2 ?? t("about.missionH2")} />
              <div className="mt-6 space-y-4 border-l-4 border-[color:var(--color-gt-accent-green)]/60 pl-5 text-base leading-relaxed text-slate-600">
                <p>{about.missionP1 ?? t("about.missionP1")}</p>
                <p>{about.missionP2 ?? t("about.missionP2")}</p>
              </div>
            </article>

            <AboutStrengthsSection about={about} items={strengths} />

            {/* Services */}
            <article
              id="services"
              className="scroll-mt-24 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8"
            >
              <AboutSectionHeader title={about.servicesH2 ?? t("about.servicesH2")} />
              <div className="mt-8 grid gap-4 md:grid-cols-2">
                {serviceCards.map((s, idx) => (
                  <div
                    key={`${s.title}-${idx}`}
                    className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-5 transition hover:border-slate-300 hover:shadow-md"
                  >
                    <span className="absolute right-4 top-4 font-[family-name:var(--font-display)] text-4xl font-bold text-slate-100 transition group-hover:text-slate-200">
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    <div className="relative">
                      <div className="mb-3 h-1 w-12 rounded-full bg-gradient-to-r from-[color:var(--color-gt-accent-green)] to-[color:var(--color-gt-blue)]" />
                      <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold text-[color:var(--color-gt-navy)]">
                        {s.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-slate-600">{s.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </article>
          </div>

          {/* Sidebar */}
          <aside className="space-y-6 lg:col-span-4">
            <div className="sticky top-24 space-y-6">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold text-[color:var(--color-gt-navy)]">
                  {about.asideMissionH3 ?? t("about.asideMissionH3")}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">
                  {about.asideMissionText ?? t("about.asideMissionText")}
                </p>
              </div>

              <div className="overflow-hidden rounded-3xl border border-[color:var(--color-gt-blue)]/20 bg-[color:var(--color-gt-navy)] p-6 text-white shadow-lg">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-200">
                  {t("home.contactKicker")}
                </p>
                <h3 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-bold">
                  {about.contactCta ?? t("about.contactCta")}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-300">
                  {about.cardCheck ?? t("about.cardCheck")}
                </p>
                <Link
                  to="/contact"
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-[color:var(--color-gt-navy)] transition hover:bg-slate-100"
                >
                  {about.contactCta ?? t("about.contactCta")}
                  <FaArrowRight className="h-3.5 w-3.5" aria-hidden />
                </Link>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold text-[color:var(--color-gt-navy)]">
                  {t("about.expertsH2")}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">
                  {about.teamFallbackDescription?.trim() || t("about.teamSubtitle")}
                </p>
                <Link
                  to="/equipe"
                  className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[color:var(--color-gt-brand-blue)] hover:underline"
                >
                  {t("home.teamViewAll")}
                  <FaArrowRight className="h-3.5 w-3.5" aria-hidden />
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <CompanyHighlights showProcess={false} />
      <QuoteBanner />
    </div>
  );
}

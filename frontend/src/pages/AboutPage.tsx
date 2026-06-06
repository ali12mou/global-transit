import { FaCheck } from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import {
  IoChatbubblesOutline,
  IoDocumentTextOutline,
  IoPeopleOutline,
  IoStatsChartOutline,
  IoRibbonOutline,
} from "react-icons/io5";
import { Logo } from "@/components/brand/Logo";
import { TeamEnterpriseShowcase } from "@/components/team/TeamEnterpriseShowcase";
import { apiFetch } from "@/api/client";
import { normalizeTeamMember } from "@/lib/teamUtils";

type AboutConfig = {
  kicker?: string;
  title?: string;
  intro?: string;
  cardTitle?: string;
  cardText?: string;
  cardCheck?: string;
  missionH2?: string;
  missionP1?: string;
  missionP2?: string;
  strengthsTitle?: string;
  standardsBadge?: string;
  servicesH2?: string;
  expertsH2?: string;
  expertsBadge?: string;
  experienceKicker?: string;
  experienceYears?: string;
  experienceText?: string;
  asideMissionH3?: string;
  asideMissionText?: string;
  contactCta?: string;
  teamEmptyText?: string;
  teamFallbackTitle?: string;
  teamFallbackDescription?: string;
  strengths?: string[];
  services?: Array<{ title?: string; text?: string }>;
};

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
  const { hash } = useLocation();
  const { data: team = [], isSuccess: teamReady } = useQuery({
    queryKey: ["team"],
    queryFn: async () => {
      const rows = await apiFetch<Record<string, unknown>[]>("/api/team", { auth: false });
      return rows.map(normalizeTeamMember);
    },
  });
  const { data: cfgRaw } = useQuery({
    queryKey: ["public-config"],
    queryFn: () => apiFetch<Record<string, unknown>>("/api/config", { auth: false }),
  });
  const about = ((cfgRaw?.about as AboutConfig | undefined) ?? {}) as AboutConfig;

  const strengths = about.strengths?.length
    ? about.strengths
    : strengthKeys.map((key) => t(`about.${key}`));
  const serviceCards = about.services?.length
    ? about.services.map((s) => ({ title: s.title ?? "", text: s.text ?? "" }))
    : serviceCardKeys.map((s) => ({
        title: t(`about.${s.title}`),
        text: t(`about.${s.text}`),
      }));

  useEffect(() => {
    if (hash !== "#equipe" || !teamReady) return;
    const el = document.getElementById("equipe");
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [hash, teamReady, team.length]);

  return (
    <div className="min-h-screen w-full bg-slate-50">
      <section className="relative w-full overflow-hidden border-b border-slate-200 bg-[color:var(--color-gt-navy)] text-white">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/images/hero/hero-4.png')" }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(105deg,rgba(4,10,20,0.88)_0%,rgba(4,10,20,0.8)_45%,rgba(4,10,20,0.68)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,197,94,0.16),transparent_46%),radial-gradient(circle_at_15%_80%,rgba(56,189,248,0.14),transparent_42%)]" />
        <div className="relative w-full px-4 py-16 sm:px-6 md:py-20 lg:px-10 xl:px-16 2xl:px-24">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-emerald-200">
            {about.kicker ?? t("about.kicker")}
          </p>
          <h1 className="mt-4 max-w-3xl font-[family-name:var(--font-display)] text-3xl font-bold leading-tight md:text-5xl">
            {about.title ?? t("about.title")}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-200 md:text-lg">
            {about.intro ?? t("about.intro")}
          </p>
        </div>
      </section>

      <section className="w-full px-4 py-10 sm:px-6 md:py-14 lg:px-10 xl:px-16 2xl:px-24">
        <div className="grid gap-6 lg:grid-cols-12">
          <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-8">
            <div className="flex flex-col items-start gap-5 md:flex-row md:items-center">
              <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
                <Logo variant="header" className="max-w-[260px]" />
              </div>
              <div>
                <h2 className="font-[family-name:var(--font-display)] text-2xl text-[color:var(--color-gt-navy)]">
                  {about.cardTitle ?? t("about.cardTitle")}
                </h2>
                <p className="mt-2 text-slate-600">{about.cardText ?? t("about.cardText")}</p>
              </div>
            </div>
            <div className="mt-5 inline-flex items-start gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-900 ring-1 ring-emerald-100">
              <FaCheck className="mt-0.5 shrink-0" />
              <span>{about.cardCheck ?? t("about.cardCheck")}</span>
            </div>
          </article>

          <aside className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              {about.experienceKicker ?? t("about.experienceKicker")}
            </p>
            <p className="mt-2 font-[family-name:var(--font-display)] text-5xl font-bold text-[color:var(--color-gt-navy)]">
              {about.experienceYears ?? t("about.experienceYears")}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              {about.experienceText ?? t("about.experienceText")}
            </p>
          </aside>
        </div>
      </section>

      <section className="w-full px-4 pb-14 sm:px-6 lg:px-10 xl:px-16 2xl:px-24">
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-8">
            <article id="mission" className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8 scroll-mt-24">
              <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold text-[color:var(--color-gt-navy)]">
                {about.missionH2 ?? t("about.missionH2")}
              </h2>
              <div className="mt-5 space-y-4 text-base leading-relaxed text-slate-600">
                <p>{about.missionP1 ?? t("about.missionP1")}</p>
                <p>{about.missionP2 ?? t("about.missionP2")}</p>
              </div>
            </article>

            <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-[color:var(--color-gt-navy)]">
                  {about.strengthsTitle ?? t("about.strengthsTitle")}
                </h2>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-800 ring-1 ring-emerald-100">
                  {about.standardsBadge ?? t("about.standardsBadge")}
                </span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {strengths.map((label, idx) => {
                  const Icon = strengthIcons[idx % strengthIcons.length]!;
                  return (
                    <div key={`${label}-${idx}`} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[color:var(--color-gt-accent-green)] shadow-sm ring-1 ring-slate-200">
                        <Icon className="h-5 w-5" aria-hidden />
                      </span>
                      <span className="text-sm font-medium text-slate-700">{label}</span>
                    </div>
                  );
                })}
              </div>
            </article>

            <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
              <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-[color:var(--color-gt-navy)]">
                {about.servicesH2 ?? t("about.servicesH2")}
              </h2>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {serviceCards.map((s, idx) => (
                  <div key={`${s.title}-${idx}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                    <div className="mb-3 h-1 w-10 rounded-full bg-[color:var(--color-gt-accent-green)]/80" />
                    <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold text-[color:var(--color-gt-navy)]">
                      {s.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">{s.text}</p>
                  </div>
                ))}
              </div>
            </article>

            <article id="equipe" className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8 scroll-mt-24">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-[color:var(--color-gt-navy)]">
                  {about.expertsH2 ?? t("about.expertsH2")}
                </h2>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-600">
                  {about.expertsBadge ?? t("about.expertsBadge")}
                </span>
              </div>

              {team.length === 0 ? (
                <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-6 text-center text-slate-600">
                  {about.teamEmptyText ?? t("publicPages.noContent")}
                </p>
              ) : (
                <TeamEnterpriseShowcase members={team} />
              )}
            </article>
          </div>

          <aside className="space-y-6 lg:col-span-4">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold text-[color:var(--color-gt-navy)]">
                {about.asideMissionH3 ?? t("about.asideMissionH3")}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                {about.asideMissionText ?? t("about.asideMissionText")}
              </p>
            </div>

            <div className="rounded-3xl border border-[color:var(--color-gt-blue)]/20 bg-[color:var(--color-gt-navy)] p-6 text-white shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200">{t("home.contactKicker")}</p>
              <h3 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-bold">{about.contactCta ?? t("about.contactCta")}</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-200">
                {about.cardCheck ?? t("about.cardCheck")}
              </p>
              <Link
                to="/contact"
                className="mt-5 inline-flex rounded-lg bg-white px-4 py-2 text-sm font-semibold text-[color:var(--color-gt-navy)] transition hover:bg-slate-100"
              >
                {about.contactCta ?? t("about.contactCta")}
              </Link>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}

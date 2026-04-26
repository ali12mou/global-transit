import { FaCheck } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import {
  IoChatbubblesOutline,
  IoDocumentTextOutline,
  IoPeopleOutline,
  IoStatsChartOutline,
  IoRibbonOutline,
} from "react-icons/io5";
import { Logo } from "@/components/brand/Logo";
import { apiFetch } from "@/api/client";

type TeamMember = {
  _id: string;
  order?: number;
  title?: string;
  name: string;
  description?: string;
  imageUrl?: string;
};

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
  const { data: team = [] } = useQuery({
    queryKey: ["team"],
    queryFn: () => apiFetch<TeamMember[]>("/api/team", { auth: false }),
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

  return (
    <div className="bg-slate-50/60">
      <section className="border-b border-slate-200/80 bg-gradient-to-b from-white to-slate-50/70">
        <div className="mx-auto w-full max-w-[1440px] px-4 py-12 sm:px-6 md:py-16 lg:px-8 xl:px-10 2xl:py-20">
          <div className="grid gap-8 lg:grid-cols-12 lg:items-start xl:gap-12">
            <div className="lg:col-span-7 xl:col-span-8">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[color:var(--color-gt-accent-green)]">
                {about.kicker ?? t("about.kicker")}
              </p>
              <h1 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-bold leading-tight text-[color:var(--color-gt-navy)] md:text-4xl lg:text-[2.65rem]">
                {about.title ?? t("about.title")}
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-relaxed text-slate-600 md:text-lg">
                {about.intro ?? t("about.intro")}
              </p>
            </div>
            <div className="lg:col-span-5 xl:col-span-4">
              <div className="rounded-3xl border border-slate-200/90 bg-white/90 p-5 shadow-[0_10px_28px_rgba(15,23,42,0.07)] sm:p-6 lg:sticky lg:top-24">
                <div className="flex flex-col items-start gap-4 sm:flex-row">
                  <div className="shrink-0 rounded-xl bg-white p-2 shadow-sm ring-1 ring-slate-200/80">
                    <Logo variant="header" className="max-w-[240px] sm:max-w-[260px]" />
                  </div>
                  <div>
                    <p className="font-semibold text-[color:var(--color-gt-navy)]">{about.cardTitle ?? t("about.cardTitle")}</p>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">{about.cardText ?? t("about.cardText")}</p>
                  </div>
                </div>
                <div className="mt-5 flex items-start gap-2 border-t border-slate-200/80 pt-5">
                  <FaCheck className="mt-0.5 shrink-0 text-[color:var(--color-gt-accent-green)]" />
                  <p className="text-sm text-slate-600">{about.cardCheck ?? t("about.cardCheck")}</p>
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
                {about.missionH2 ?? t("about.missionH2")}
              </h2>
              <div className="mt-4 space-y-4 text-slate-600 leading-relaxed">
                <p>{about.missionP1 ?? t("about.missionP1")}</p>
                <p>{about.missionP2 ?? t("about.missionP2")}</p>
              </div>

              <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50/60 p-4 sm:p-5">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold text-[color:var(--color-gt-navy)]">
                    {about.strengthsTitle ?? t("about.strengthsTitle")}
                  </h3>
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-800 ring-1 ring-emerald-100">
                    {about.standardsBadge ?? t("about.standardsBadge")}
                  </span>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {strengths.map((label, idx) => {
                    const Icon = strengthIcons[idx % strengthIcons.length]!;
                    return (
                      <div
                        key={`${label}-${idx}`}
                        className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/60 px-4 py-3"
                      >
                        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-[color:var(--color-gt-accent-green)] shadow-sm ring-1 ring-slate-100">
                          <Icon className="h-5 w-5" aria-hidden />
                        </span>
                        <span className="text-sm font-medium text-slate-800">{label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.05)] sm:p-6 lg:p-8">
              <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-[color:var(--color-gt-navy)] md:text-3xl">
                {about.servicesH2 ?? t("about.servicesH2")}
              </h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
                {serviceCards.map((s, idx) => (
                  <div
                    key={`${s.title}-${idx}`}
                    className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm transition hover:border-slate-300/90 hover:shadow-md"
                  >
                    <div className="mb-3 h-1 w-10 rounded-full bg-[color:var(--color-gt-accent-green)]/80" />
                    <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold text-[color:var(--color-gt-navy)]">
                      {s.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">{s.text}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.05)] sm:p-6 lg:p-8">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-[color:var(--color-gt-navy)] md:text-3xl">
                  {about.expertsH2 ?? t("about.expertsH2")}
                </h2>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-600">
                  {about.expertsBadge ?? t("about.expertsBadge")}
                </span>
              </div>

              <div className="grid gap-5 sm:grid-cols-2 2xl:grid-cols-3">
                {team.length === 0 ? (
                  <p className="col-span-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-6 text-center text-slate-600">
                    {t("publicPages.noContent")}
                  </p>
                ) : (
                  team.map((member, index) => (
                    <article
                      key={member._id}
                      className="group relative overflow-hidden rounded-3xl border border-slate-200/90 bg-gradient-to-b from-white to-slate-50/80 shadow-[0_6px_20px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_28px_rgba(15,23,42,0.12)]"
                    >
                      <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[color:var(--color-gt-blue)] via-[color:var(--color-gt-accent-green)] to-[color:var(--color-gt-blue)]" />
                      {member.imageUrl ? (
                        <div className="relative aspect-[4/5] max-h-[400px] min-h-[280px]">
                          <img
                            src={member.imageUrl}
                            alt={member.name}
                            className="h-full w-full object-cover object-top transition duration-500 group-hover:scale-[1.03]"
                            loading="lazy"
                          />
                          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-900/45 to-transparent" />
                        </div>
                      ) : null}
                      <div className="p-6">
                        <div className="mb-2 flex items-center justify-between gap-2">
                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--color-gt-accent-green)]">
                            {member.title || "TEAM"}
                          </p>
                          <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-bold text-slate-500">
                            #{member.order ?? index + 1}
                          </span>
                        </div>
                        <h3 className="mt-2 font-[family-name:var(--font-display)] text-xl font-bold text-[color:var(--color-gt-navy)]">
                          {member.name}
                        </h3>
                        <p className="mt-3 text-sm leading-relaxed text-slate-600">{member.description || "—"}</p>
                      </div>
                    </article>
                  ))
                )}
              </div>
            </div>
          </div>

          <aside className="space-y-6 xl:col-span-4 2xl:col-span-3">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm xl:sticky xl:top-24">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                {about.experienceKicker ?? t("about.experienceKicker")}
              </p>
              <p className="mt-2 font-[family-name:var(--font-display)] text-4xl font-bold text-[color:var(--color-gt-navy)]">
                {about.experienceYears ?? t("about.experienceYears")}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">{about.experienceText ?? t("about.experienceText")}</p>
              <ul className="mt-6 space-y-2">
                {strengths.map((label, idx) => (
                  <li
                    key={`${label}-aside-${idx}`}
                    className="rounded-lg border border-slate-100 bg-slate-50/80 px-3 py-2 text-sm text-slate-700"
                  >
                    {label}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold text-[color:var(--color-gt-navy)]">
                {about.asideMissionH3 ?? t("about.asideMissionH3")}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">{about.asideMissionText ?? t("about.asideMissionText")}</p>
              <Link
                to="/contact"
                className="mt-5 inline-flex text-sm font-semibold text-[color:var(--color-gt-blue)] hover:underline"
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

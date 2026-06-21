import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { FaUsers } from "react-icons/fa";
import { AboutTeamSection } from "@/components/about/AboutTeamSection";
import { TeamCompactShowcase } from "@/components/team/TeamCompactShowcase";
import { apiFetch } from "@/api/client";
import { parseAboutConfig } from "@/lib/aboutConfig";
import { applyTeamFallbacks, normalizeTeamMember } from "@/lib/teamUtils";

export function TeamPage() {
  const { t } = useTranslation();

  const { data: teamRaw = [], isLoading: teamLoading } = useQuery({
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

  const about = parseAboutConfig(cfgRaw?.about);

  const team = applyTeamFallbacks(teamRaw, {
    title: about.teamFallbackTitle,
    description: about.teamFallbackDescription,
  });

  const standardMembers = team.filter((m) => m.layout !== "compact");
  const compactMembers = team.filter((m) => m.layout === "compact");

  return (
    <div className="min-h-screen bg-slate-50">
      <section className="relative overflow-hidden gt-brand-blue-bg text-white">
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-24 lg:px-8">
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-white/75">
            {t("publicPages.teamKicker")}
          </p>
          <h1 className="mt-4 max-w-3xl font-[family-name:var(--font-display)] text-3xl font-bold leading-tight md:text-5xl">
            {about.expertsH2?.trim() || t("publicPages.teamTitle")}
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/85 md:text-lg">
            {about.teamFallbackDescription?.trim() || t("publicPages.teamIntro")}
          </p>
          {!teamLoading && team.length > 0 ? (
            <div className="mt-8 inline-flex items-center gap-3 rounded-2xl border border-white/20 bg-white/10 px-5 py-3 backdrop-blur-sm">
              <FaUsers className="h-5 w-5 text-white/90" aria-hidden />
              <span className="text-sm font-semibold text-white">
                {t("about.teamCount", { count: team.length, defaultValue: `${team.length}` })}
              </span>
            </div>
          ) : null}
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-b from-transparent to-slate-50" />
      </section>

      <AboutTeamSection
        members={standardMembers}
        about={about}
        isLoading={teamLoading}
        hideHeader
      />

      <section className="border-t border-slate-200/80 bg-white py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[color:var(--color-gt-brand-blue)]">
              {t("publicPages.teamLeadershipKicker")}
            </p>
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-2xl font-bold text-[color:var(--color-gt-navy)] md:text-3xl">
              {t("publicPages.teamLeadershipTitle")}
            </h2>
          </div>
          {teamLoading ? (
            <p className="text-center text-slate-500">{t("publicPages.loading")}</p>
          ) : compactMembers.length > 0 ? (
            <TeamCompactShowcase members={compactMembers} />
          ) : (
            <p className="text-center text-slate-500">{t("publicPages.noContent")}</p>
          )}
        </div>
      </section>
    </div>
  );
}

import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa";
import { TeamHomeCarousel } from "@/components/team/TeamHomeCarousel";
import { apiFetch } from "@/api/client";
import { parseAboutConfig } from "@/lib/aboutConfig";
import { applyTeamFallbacks, normalizeTeamMember } from "@/lib/teamUtils";

export function TeamHomeSection() {
  const { t } = useTranslation();

  const { data: cfgRaw } = useQuery({
    queryKey: ["public-config"],
    queryFn: () => apiFetch<Record<string, unknown>>("/api/config", { auth: false }),
  });
  const about = parseAboutConfig(cfgRaw?.about);

  const { data: teamRaw = [], isLoading } = useQuery({
    queryKey: ["team"],
    queryFn: async () => {
      const rows = await apiFetch<Record<string, unknown>[]>("/api/team", { auth: false });
      return rows.map(normalizeTeamMember);
    },
  });

  const team = applyTeamFallbacks(teamRaw, {
    title: about.teamFallbackTitle,
    description: about.teamFallbackDescription,
  });

  const title = about.expertsH2?.trim() || t("home.teamTitle");
  const badge = about.expertsBadge?.trim() || t("home.teamBadge");
  const emptyText = about.teamEmptyText?.trim() || t("home.teamEmpty");
  return (
    <section className="relative overflow-hidden border-y border-slate-200/80 bg-gradient-to-b from-white via-slate-50/80 to-white py-20 md:py-24">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(46,125,87,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(46,125,87,0.05) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
        }}
      />
      <div className="relative mx-auto max-w-7xl px-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl text-center md:text-left">
            <span className="text-xs font-bold uppercase tracking-[0.28em] text-[color:var(--color-gt-accent-green)]">
              {t("home.teamKicker")}
            </span>
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-bold text-[color:var(--color-gt-navy)] md:text-4xl">
              {title}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600 md:text-base">
              {t("home.teamSubtitle")}
            </p>
          </div>
          <span className="mx-auto inline-flex rounded-full border border-slate-200 bg-white px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-600 shadow-sm md:mx-0">
            {badge}
          </span>
        </div>

        <div className="mt-12">
          {isLoading ? (
            <p className="text-center text-slate-500">{t("publicPages.loading")}</p>
          ) : team.length === 0 ? (
            <p className="rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center text-slate-500 shadow-sm">
              {emptyText}
            </p>
          ) : (
            <>
              <TeamHomeCarousel members={team} />
              <div className="mt-10 flex justify-center">
                <Link
                  to="/equipe"
                  className="inline-flex items-center gap-2 rounded-lg bg-[color:var(--color-gt-navy)] px-6 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-[color:var(--color-gt-blue)]"
                >
                  {t("home.teamViewAll")}
                  <FaArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

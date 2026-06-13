import { useTranslation } from "react-i18next";
import { FaUsers } from "react-icons/fa";
import { AboutSectionHeader } from "@/components/about/AboutSectionHeader";
import { TeamEnterpriseShowcase } from "@/components/team/TeamEnterpriseShowcase";
import { TeamMemberCardSkeleton } from "@/components/team/TeamMemberCard";
import type { TeamShowcaseMember } from "@/components/team/TeamMemberCard";
import type { AboutConfig } from "@/lib/aboutConfig";

type Props = {
  members: TeamShowcaseMember[];
  about: AboutConfig;
  isLoading?: boolean;
};

export function AboutTeamSection({ members, about, isLoading }: Props) {
  const { t } = useTranslation();

  const title = about.expertsH2?.trim() || t("about.expertsH2");
  const badge = about.expertsBadge?.trim() || t("about.expertsBadge");
  const subtitle =
    about.teamFallbackDescription?.trim() || t("about.teamSubtitle", { defaultValue: "" });
  const emptyText = about.teamEmptyText?.trim() || t("publicPages.noContent");

  return (
    <section
      id="equipe"
      className="relative scroll-mt-24 overflow-hidden border-t border-slate-200/80 bg-gradient-to-b from-slate-100/80 via-white to-slate-50 py-16 md:py-24"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.4]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(46,125,87,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(46,125,87,0.04) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      <div className="pointer-events-none absolute -right-24 top-0 h-72 w-72 rounded-full bg-[color:var(--color-gt-accent-green)]/10 blur-3xl" />
      <div className="pointer-events-none absolute -left-16 bottom-0 h-64 w-64 rounded-full bg-[color:var(--color-gt-blue)]/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <AboutSectionHeader
            kicker={t("about.teamKicker")}
            title={title}
            badge={badge}
            subtitle={subtitle || undefined}
          />
          {!isLoading && members.length > 0 ? (
            <div className="flex shrink-0 items-center gap-3 rounded-2xl border border-slate-200/90 bg-white px-5 py-4 shadow-sm">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[color:var(--color-gt-navy)] text-white shadow-sm">
                <FaUsers className="h-5 w-5" aria-hidden />
              </span>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {t("about.teamCountLabel")}
                </p>
                <p className="font-[family-name:var(--font-display)] text-2xl font-bold text-[color:var(--color-gt-navy)]">
                  {t("about.teamCount", { count: members.length, defaultValue: `${members.length}` })}
                </p>
              </div>
            </div>
          ) : null}
        </div>

        <div className="mt-12">
          {isLoading ? (
            <div className="grid grid-cols-1 place-items-center gap-8 sm:grid-cols-2 xl:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <TeamMemberCardSkeleton key={i} />
              ))}
            </div>
          ) : members.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white/80 px-6 py-16 text-center shadow-sm">
              <FaUsers className="mx-auto h-12 w-12 text-slate-300" aria-hidden />
              <p className="mt-4 text-base text-slate-600">{emptyText}</p>
              <p className="mt-2 text-sm text-slate-400">{t("about.teamAdminHint")}</p>
            </div>
          ) : (
            <TeamEnterpriseShowcase members={members} />
          )}
        </div>
      </div>
    </section>
  );
}

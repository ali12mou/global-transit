import { TeamCompactContactCard } from "@/components/team/TeamCompactContactCard";
import type { TeamShowcaseMember } from "@/components/team/TeamMemberCard";

type Props = {
  members: TeamShowcaseMember[];
};

/** Organigramme direction — 1 carte PDG centrée, puis rangée de cartes en dessous. */
export function TeamCompactShowcase({ members }: Props) {
  const sorted = [...members].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  if (sorted.length === 0) return null;

  if (sorted.length === 1) {
    return (
      <div className="flex justify-center">
        <TeamCompactContactCard member={sorted[0]!} className="w-full max-w-[240px]" />
      </div>
    );
  }

  const [leader, ...rest] = sorted;

  return (
    <div className="mx-auto max-w-6xl space-y-6 md:space-y-8">
      <div className="flex justify-center">
        <TeamCompactContactCard member={leader!} className="w-full max-w-[240px]" />
      </div>
      {rest.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
          {rest.map((member) => (
            <TeamCompactContactCard key={member._id} member={member} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

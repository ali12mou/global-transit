import { TeamMemberCard, type TeamShowcaseMember } from "@/components/team/TeamMemberCard";

type Props = {
  members: TeamShowcaseMember[];
};

/** Grille À propos — mêmes cartes et tailles d’image que l’accueil (360px, ratio 4:3). */
export function TeamEnterpriseShowcase({ members }: Props) {
  const sorted = [...members].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  if (sorted.length === 1) {
    return (
      <div className="flex justify-center">
        <TeamMemberCard member={sorted[0]!} />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 place-items-center gap-8 sm:grid-cols-2 xl:grid-cols-3">
      {sorted.map((member) => (
        <TeamMemberCard key={member._id} member={member} />
      ))}
    </div>
  );
}

export type { TeamShowcaseMember } from "@/components/team/TeamMemberCard";

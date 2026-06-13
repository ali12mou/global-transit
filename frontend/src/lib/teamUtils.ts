import type { TeamShowcaseMember } from "@/components/team/TeamMemberCard";

/** Normalise un membre renvoyé par l’API (Mongo) pour l’affichage public. */
export function normalizeTeamMember(raw: Record<string, unknown>): TeamShowcaseMember {
  const id = raw._id != null ? String(raw._id) : "";
  return {
    _id: id,
    order: typeof raw.order === "number" ? raw.order : Number(raw.order) || 0,
    title: String(raw.title ?? "").trim(),
    name: String(raw.name ?? "").trim() || "—",
    phone: String(raw.phone ?? "").trim(),
    email: String(raw.email ?? "").trim(),
    website: String(raw.website ?? "").trim(),
    formation: String(raw.formation ?? "").trim(),
    description: String(raw.description ?? "").trim(),
    imageUrl: resolveTeamImageUrl(String(raw.imageUrl ?? "")),
  };
}

export function resolveTeamImageUrl(url: string): string {
  const t = url.trim();
  if (!t) return "";
  if (t.startsWith("http://") || t.startsWith("https://") || t.startsWith("/")) return t;
  return `/uploads/${t.replace(/^\/+/, "")}`;
}

/** Applique les valeurs par défaut configurées dans l’admin (page À propos). */
export function applyTeamFallbacks(
  members: TeamShowcaseMember[],
  fallbacks: { title?: string; description?: string }
): TeamShowcaseMember[] {
  const fbTitle = fallbacks.title?.trim() ?? "";
  const fbDesc = fallbacks.description?.trim() ?? "";
  return members.map((m) => ({
    ...m,
    title: m.title?.trim() || fbTitle,
    description: m.description?.trim() || fbDesc,
  }));
}

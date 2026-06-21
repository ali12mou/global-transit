export type AboutConfig = {
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
  strengthsKicker?: string;
  strengthsIntro?: string;
  strengthsTagline?: string;
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

export function parseAboutConfig(raw: unknown): AboutConfig {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  return raw as AboutConfig;
}

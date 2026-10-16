import type { TFunction } from "i18next";

/** Services saisis dans l'admin (en français / anglais) → clés de traduction about.svc*. */
const SERVICE_KEYS: { match: RegExp; key: string }[] = [
  { match: /clearance|dédouan|dedouan/i, key: "Clearance" },
  { match: /logisti/i, key: "Logistics" },
  { match: /syst[eè]me|douane|customs/i, key: "Customs" },
  { match: /transit/i, key: "Transit" },
  { match: /document/i, key: "Docs" },
];

/**
 * Hors français, remplace le titre / la description d'un service connu par sa traduction
 * (les contenus de l'admin sont rédigés en français).
 */
export function localizeService(
  svc: { title: string; description?: string },
  t: TFunction,
  isFrench: boolean
): { title: string; description: string; translated: boolean } {
  const title = svc.title ?? "";
  const description = svc.description ?? "";
  if (isFrench) return { title, description, translated: false };
  const hit = SERVICE_KEYS.find((s) => s.match.test(title));
  if (!hit) return { title, description, translated: false };
  return {
    title: t(`about.svc${hit.key}Title`),
    description: t(`about.svc${hit.key}Text`),
    translated: true,
  };
}

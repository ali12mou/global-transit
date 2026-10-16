/** Année de création de Global Transit and Transport Services (16 ans d'expérience en 2026). */
export const COMPANY_FOUNDED_YEAR = 2010;

/** Années d'expérience, recalculées automatiquement chaque année (2026 → 16, 2027 → 17…). */
export function yearsOfExperience(now = new Date()): number {
  return now.getFullYear() - COMPANY_FOUNDED_YEAR;
}

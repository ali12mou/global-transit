export type LocaleCode = "fr" | "en" | "ar" | "am" | "sw" | "so" | "om";

export const LANGUAGES: {
  code: LocaleCode;
  /** Libellé dans la langue elle-même */
  label: string;
  /** Code court affiché dans l’en-tête */
  short: string;
  /** RTL pour l’arabe */
  dir: "ltr" | "rtl";
}[] = [
  { code: "fr", label: "Français", short: "FR", dir: "ltr" },
  { code: "en", label: "English", short: "EN", dir: "ltr" },
  { code: "ar", label: "العربية", short: "AR", dir: "rtl" },
  { code: "am", label: "አማርኛ", short: "AM", dir: "ltr" },
  { code: "sw", label: "Kiswahili", short: "SW", dir: "ltr" },
  { code: "so", label: "Soomaali", short: "SO", dir: "ltr" },
  { code: "om", label: "Afaan Oromoo", short: "OM", dir: "ltr" },
];

const STORAGE_KEY = "gt_locale";

export function getStoredLocale(): LocaleCode | null {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v && LANGUAGES.some((l) => l.code === v)) return v as LocaleCode;
  } catch {
    /* ignore */
  }
  return null;
}

export function setStoredLocale(code: LocaleCode) {
  try {
    localStorage.setItem(STORAGE_KEY, code);
  } catch {
    /* ignore */
  }
}

export function applyDocumentLang(code: LocaleCode) {
  const meta = LANGUAGES.find((l) => l.code === code) ?? LANGUAGES[0];
  document.documentElement.lang = code;
  document.documentElement.dir = meta.dir;
}

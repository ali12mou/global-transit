import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import type { LocaleCode } from "./languages";
import { applyDocumentLang, getStoredLocale, LANGUAGES, setStoredLocale } from "./languages";

import fr from "@/locales/fr.json";
import en from "@/locales/en.json";
import ar from "@/locales/ar.json";
import am from "@/locales/am.json";
import sw from "@/locales/sw.json";
import so from "@/locales/so.json";
import om from "@/locales/om.json";

const resources = {
  fr: { translation: fr },
  en: { translation: en },
  ar: { translation: ar },
  am: { translation: am },
  sw: { translation: sw },
  so: { translation: so },
  om: { translation: om },
} as const;

const fallbackLng: LocaleCode = "fr";

function initialLanguage(): LocaleCode {
  const stored = getStoredLocale();
  if (stored) return stored;
  const nav = typeof navigator !== "undefined" ? navigator.language.slice(0, 2) : "";
  const match = LANGUAGES.find((l) => l.code === nav);
  if (match) return match.code;
  return fallbackLng;
}

const lng = initialLanguage();
applyDocumentLang(lng);
setStoredLocale(lng);

void i18n.use(initReactI18next).init({
  resources,
  lng,
  fallbackLng,
  interpolation: { escapeValue: false },
});

i18n.on("languageChanged", (code: string) => {
  if (LANGUAGES.some((l) => l.code === code)) {
    const lc = code as LocaleCode;
    applyDocumentLang(lc);
    setStoredLocale(lc);
  }
});

export default i18n;

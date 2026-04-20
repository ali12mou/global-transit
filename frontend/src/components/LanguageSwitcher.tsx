import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { FaGlobe } from "react-icons/fa";
import { LANGUAGES } from "@/i18n/languages";

type LanguageSwitcherProps = {
  /** default: barre claire · dark: sidebar admin · onDark: fond bleu (login) */
  variant?: "default" | "dark" | "onDark";
  ariaLabel?: string;
};

export function LanguageSwitcher({ variant = "default", ariaLabel }: LanguageSwitcherProps) {
  const { i18n, t } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = LANGUAGES.find((l) => l.code === i18n.language) ?? LANGUAGES[0];

  const label = ariaLabel ?? t("admin.langAria");

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  const btnClass =
    variant === "dark"
      ? "flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-sm font-medium text-white/95 transition hover:bg-white/12 hover:text-white"
      : variant === "onDark"
        ? "flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm backdrop-blur-md transition hover:bg-white/18"
        : "flex items-center gap-1.5 rounded-md px-1 py-1 text-sm text-slate-700 hover:bg-slate-100 hover:text-[color:var(--color-gt-blue)]";

  const listClass =
    variant === "dark"
      ? "absolute bottom-full left-0 z-[80] mb-2 min-w-[220px] rounded-xl border border-slate-600/80 bg-[#0f1f35] py-1 shadow-xl shadow-black/40 ring-1 ring-white/10"
      : "absolute end-0 top-full z-[100] mt-2 min-w-[220px] rounded-lg border border-slate-200 bg-white py-1 shadow-lg";

  const optionClass = (active: boolean) =>
    variant === "dark"
      ? `w-full px-4 py-2.5 text-start text-sm transition hover:bg-white/10 ${
          active ? "font-semibold text-amber-200" : "text-white/90"
        }`
      : `w-full px-4 py-2.5 text-start text-sm hover:bg-slate-50 ${
          active ? "font-bold text-[color:var(--color-gt-navy)]" : "text-slate-800"
        }`;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={btnClass}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={label}
      >
        <FaGlobe className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
        <span className="font-semibold tabular-nums">{current.short}</span>
      </button>
      {open && (
        <ul role="listbox" className={listClass}>
          {LANGUAGES.map((lang) => (
            <li key={lang.code} role="presentation">
              <button
                type="button"
                role="option"
                aria-selected={i18n.language === lang.code}
                className={optionClass(i18n.language === lang.code)}
                onClick={() => {
                  void i18n.changeLanguage(lang.code);
                  setOpen(false);
                }}
              >
                {lang.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

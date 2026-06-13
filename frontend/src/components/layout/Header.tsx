import { useMemo, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  FaEnvelope,
  FaPhone,
  FaWhatsapp,
  FaBars,
  FaTimes,
} from "react-icons/fa";
import { Logo } from "@/components/brand/Logo";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { buildWhatsAppUrl, COMPANY_WHATSAPP_DIGITS } from "@/lib/contactReply";

export function Header() {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);

  const companyWhatsAppUrl = useMemo(
    () => buildWhatsAppUrl(COMPANY_WHATSAPP_DIGITS, t("contact.whatsappPrefilledMessage")),
    [t, i18n.language]
  );

  const nav = useMemo(
    () => [
      { to: "/a-propos", label: t("nav.about") },
      { to: "/activites", label: t("nav.activities") },
      { to: "/projets", label: t("nav.projects") },
      { to: "/infrastructures", label: t("nav.infrastructure") },
      { to: "/actualites", label: t("nav.news") },
      { to: "/contact", label: t("nav.contact") },
    ],
    [t]
  );

  return (
    <header className="sticky top-0 z-50 shadow-sm">
      <div className="gt-brand-blue-bg text-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-2 text-sm">
          <div className="flex flex-wrap items-center gap-4 md:gap-6">
            <a href="mailto:info@gttsgroup.com" className="flex items-center gap-2 hover:opacity-90">
              <FaEnvelope className="shrink-0 opacity-90" />
              <span className="hidden sm:inline">info@gttsgroup.com</span>
            </a>
            <span className="flex items-center gap-2">
              <FaPhone className="shrink-0 opacity-90" />
              <span>+253 21 34 17 16</span>
            </span>
            <span className="hidden items-center gap-2 md:flex">
              <FaPhone className="shrink-0 opacity-90" />
              <span>+253 77 82 18 32</span>
            </span>
          </div>
          <a
            href={companyWhatsAppUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-[color:var(--color-gt-whatsapp)] px-4 py-1.5 text-sm font-medium text-white hover:brightness-110"
          >
            <FaWhatsapp className="text-lg" />
            {t("header.whatsappCta")}
          </a>
        </div>
      </div>

      <div className="border-b border-slate-200/80 bg-[#f5f6f4]">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
          <Link to="/" className="flex min-w-0 items-center" aria-label={t("header.homeAria")}>
            <Logo variant="header" />
          </Link>

          <nav className="hidden items-center gap-6 lg:flex">
            {nav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `text-sm font-medium ${isActive ? "text-[color:var(--color-gt-blue)]" : "text-slate-700 hover:text-[color:var(--color-gt-blue)]"}`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link
              to="/admin/login"
              className="hidden rounded-full bg-[color:var(--color-gt-blue)] px-5 py-2 text-sm font-semibold text-white hover:opacity-95 sm:inline-block"
            >
              {t("header.login")}
            </Link>
            <div className="hidden h-6 w-px bg-slate-300 sm:block" />
            <div className="hidden sm:block">
              <LanguageSwitcher />
            </div>
            <button
              type="button"
              className="rounded-lg p-2 text-[color:var(--color-gt-blue)] lg:hidden"
              aria-label={t("header.menu")}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <FaTimes size={22} /> : <FaBars size={22} />}
            </button>
          </div>
        </div>

        {open && (
          <div className="border-t border-slate-200 bg-[#f5f6f4] px-4 py-4 lg:hidden">
            <nav className="flex flex-col gap-3">
              {nav.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className="text-base font-medium text-slate-800"
                >
                  {item.label}
                </NavLink>
              ))}
              <div className="flex items-center justify-between border-t border-slate-200 pt-3">
                <LanguageSwitcher />
              </div>
              <Link
                to="/admin/login"
                className="mt-1 rounded-full bg-[color:var(--color-gt-blue)] px-4 py-2 text-center text-sm font-semibold text-white"
                onClick={() => setOpen(false)}
              >
                {t("header.login")}
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

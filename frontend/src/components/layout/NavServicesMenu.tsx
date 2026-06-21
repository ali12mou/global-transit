import { useMemo, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { IoChevronDown } from "react-icons/io5";

type SubItem = { to: string; label: string; hash?: string };

function isItemActive(pathname: string, hash: string, item: SubItem): boolean {
  if (item.hash) {
    return pathname === "/a-propos" && hash === item.hash;
  }
  if (item.to === "/projets") {
    return pathname === "/projets" || pathname.startsWith("/projets/");
  }
  return pathname === item.to;
}

export function NavServicesMenu({
  variant = "desktop",
  onNavigate,
}: {
  variant?: "desktop" | "mobile";
  onNavigate?: () => void;
}) {
  const { t } = useTranslation();
  const { pathname, hash } = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const items = useMemo<SubItem[]>(
    () => [
      { to: "/activites", label: t("nav.activities") },
      { to: "/projets", label: t("nav.projects") },
      { to: "/infrastructures", label: t("nav.infrastructure") },
      { to: "/equipe", label: t("nav.team") },
    ],
    [t]
  );

  const groupActive = items.some((item) => isItemActive(pathname, hash, item));

  if (variant === "mobile") {
    return (
      <div className="border-b border-slate-200/80 pb-2">
        <button
          type="button"
          className="flex w-full items-center justify-between py-1 text-base font-semibold text-[color:var(--color-gt-accent-orange)]"
          onClick={() => setMobileOpen((v) => !v)}
          aria-expanded={mobileOpen}
        >
          {t("nav.services")}
          <IoChevronDown
            className={`h-4 w-4 transition ${mobileOpen ? "rotate-180" : ""}`}
            aria-hidden
          />
        </button>
        {mobileOpen && (
          <div className="mt-2 flex flex-col gap-2 border-l-2 border-[color:var(--color-gt-accent-orange)]/30 ps-4">
            {items.map((item) => (
              <Link
                key={item.to + (item.hash ?? "")}
                to={item.hash ? `${item.to}${item.hash}` : item.to}
                onClick={() => {
                  setMobileOpen(false);
                  onNavigate?.();
                }}
                className={`text-sm font-medium ${
                  isItemActive(pathname, hash, item)
                    ? "text-[color:var(--color-gt-brand-blue)]"
                    : "text-[color:var(--color-gt-navy)] hover:text-[color:var(--color-gt-brand-blue)]"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="group relative">
      <button
        type="button"
        className={`inline-flex items-center gap-1.5 text-sm font-semibold transition ${
          groupActive
            ? "text-[color:var(--color-gt-accent-orange)]"
            : "text-[color:var(--color-gt-accent-orange)] hover:opacity-90"
        }`}
        aria-haspopup="true"
        aria-expanded={undefined}
      >
        {t("nav.services")}
        <IoChevronDown className="h-3.5 w-3.5 transition group-hover:rotate-180 group-focus-within:rotate-180" />
      </button>

      <div
        className="invisible absolute left-0 top-full z-50 min-w-[240px] pt-2 opacity-0 transition-all duration-150 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100"
        role="menu"
      >
        <div className="rounded-md border border-slate-200/90 bg-[#f5f6f4] py-2 shadow-lg shadow-slate-900/10">
          {items.map((item) => {
            const active = isItemActive(pathname, hash, item);
            const href = item.hash ? `${item.to}${item.hash}` : item.to;
            return (
              <Link
                key={item.to + (item.hash ?? "")}
                to={href}
                role="menuitem"
                className={`block px-5 py-2.5 text-sm font-medium transition ${
                  active
                    ? "bg-white text-[color:var(--color-gt-brand-blue)]"
                    : "text-[color:var(--color-gt-navy)] hover:bg-white/80 hover:text-[color:var(--color-gt-brand-blue)]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function useMainNavLinks() {
  const { t } = useTranslation();
  return useMemo(
    () => [
      { to: "/a-propos", label: t("nav.about") },
      { to: "/actualites", label: t("nav.news") },
      { to: "/contact", label: t("nav.contact") },
    ],
    [t]
  );
}

export function MainNavLink({
  to,
  label,
  className,
  onClick,
  end,
}: {
  to: string;
  label: string;
  className?: string;
  onClick?: () => void;
  end?: boolean;
}) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) =>
        `${className ?? ""} text-sm font-medium ${
          isActive
            ? "text-[color:var(--color-gt-blue)]"
            : "text-slate-700 hover:text-[color:var(--color-gt-blue)]"
        }`
      }
    >
      {label}
    </NavLink>
  );
}

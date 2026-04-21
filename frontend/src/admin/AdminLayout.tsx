import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { IoLogOutOutline } from "react-icons/io5";
import { setToken } from "@/api/client";
import { Logo } from "@/components/brand/Logo";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { adminNavItems } from "./adminNavConfig";

export function AdminLayout() {
  const { t } = useTranslation();
  const nav = useNavigate();

  function logout() {
    setToken(null);
    nav("/admin/login");
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-slate-100">
      <aside className="hidden w-[260px] shrink-0 flex-col border-r border-white/10 bg-gradient-to-b from-[#050d1a] via-[color:var(--color-gt-navy)] to-[#050d1a] text-white shadow-[4px_0_24px_rgba(0,0,0,0.12)] md:flex">
        <div className="border-b border-white/10 px-4 py-5">
          <Logo variant="admin" />
          <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-400/90">
            {t("admin.sidebarKicker")}
          </p>
        </div>
        <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-2 py-3">
          {adminNavItems.map(({ to, labelKey, Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/admin"}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all ${
                  isActive
                    ? "border border-white/10 bg-white/12 font-semibold text-white shadow-inner ring-1 ring-amber-400/25"
                    : "text-white/85 hover:bg-white/8 hover:text-white"
                }`
              }
            >
              <Icon className="h-5 w-5 shrink-0 opacity-90" aria-hidden />
              <span className="truncate">{t(labelKey)}</span>
            </NavLink>
          ))}
        </nav>
        <div className="space-y-2 border-t border-white/10 p-3">
          <LanguageSwitcher variant="dark" />
          <button
            type="button"
            onClick={logout}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 px-3 py-2.5 text-sm font-medium text-white/95 transition hover:bg-red-500/20 hover:text-white"
          >
            <IoLogOutOutline className="h-5 w-5" aria-hidden />
            {t("admin.logout")}
          </button>
        </div>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="sticky top-0 z-40 flex items-center justify-between gap-3 border-b border-slate-200/90 bg-white/90 px-4 py-3 shadow-sm backdrop-blur-md md:hidden">
          <span className="font-semibold text-[color:var(--color-gt-navy)]">{t("admin.mobileTitle")}</span>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <button type="button" onClick={logout} className="text-sm font-medium text-slate-600 underline-offset-2 hover:text-[color:var(--color-gt-blue)] hover:underline">
              {t("admin.logout")}
            </button>
          </div>
        </header>
        <nav className="border-b border-slate-200/80 bg-white/90 px-3 py-2 backdrop-blur md:hidden">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {adminNavItems.map(({ to, labelKey }) => (
              <NavLink
                key={`mobile-${to}`}
                to={to}
                end={to === "/admin"}
                className={({ isActive }) =>
                  `shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                    isActive
                      ? "border-[color:var(--color-gt-navy)] bg-[color:var(--color-gt-navy)] text-white"
                      : "border-slate-300 bg-white text-slate-700 hover:border-slate-400"
                  }`
                }
              >
                {t(labelKey)}
              </NavLink>
            ))}
          </div>
        </nav>
        <main className="flex-1 overflow-auto p-4 md:p-8 lg:p-10">
          <div className="mx-auto w-full max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

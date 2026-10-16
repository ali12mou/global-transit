import { useEffect, useRef, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
  IoChevronForward,
  IoClose,
  IoGlobeOutline,
  IoLogOutOutline,
  IoMailUnreadOutline,
  IoMenu,
  IoNotificationsOutline,
} from "react-icons/io5";
import { ApiError, apiFetch, setToken } from "@/api/client";
import { Logo } from "@/components/brand/Logo";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { formatRelativePast } from "@/lib/relativeTime";
import { adminNavGroups, findAdminNavItem } from "./adminNavConfig";
import { AdminFeedbackProvider } from "./ui/AdminFeedback";

type Me = { email: string; roleId?: { name?: string } | string | null };
type Notifications = {
  unread: number;
  items: { id: string; fullName: string; email: string; service: string; at: string }[];
};

/** Rafraîchissement du badge « nouveaux messages » */
const NOTIFICATIONS_POLL_MS = 60_000;

export function AdminLayout() {
  const { t } = useTranslation();
  const nav = useNavigate();
  const { pathname } = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const me = useQuery({
    queryKey: ["admin-me"],
    queryFn: () => apiFetch<Me>("/api/auth/me"),
    retry: false,
  });

  const notifications = useQuery({
    queryKey: ["admin-notifications"],
    queryFn: () => apiFetch<Notifications>("/api/admin/notifications"),
    refetchInterval: NOTIFICATIONS_POLL_MS,
    retry: false,
  });

  function logout() {
    setToken(null);
    nav("/admin/login");
  }

  // Session expirée ou compte désactivé → retour à la connexion
  useEffect(() => {
    if (me.error instanceof ApiError && me.error.status === 401) {
      setToken(null);
      nav("/admin/login", { replace: true, state: { expired: true } });
    }
  }, [me.error, nav]);

  useEffect(() => setDrawerOpen(false), [pathname]);

  const current = findAdminNavItem(pathname);
  const unread = notifications.data?.unread ?? 0;
  const roleName = typeof me.data?.roleId === "object" ? me.data?.roleId?.name : undefined;

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-2 border-b border-white/10 px-5 py-5">
        <Link to="/admin" aria-label={t("admin.nav.dashboard")}>
          <Logo variant="admin" />
        </Link>
        <button
          type="button"
          className="rounded-lg p-2 text-white/80 hover:bg-white/10 md:hidden"
          onClick={() => setDrawerOpen(false)}
          aria-label={t("admin.closeMenu")}
        >
          <IoClose className="h-5 w-5" />
        </button>
      </div>
      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5" aria-label={t("admin.sidebarKicker")}>
        {adminNavGroups.map((group) => (
          <div key={group.labelKey}>
            <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.22em] text-[color:var(--color-gt-gold-bright)]/80">
              {t(group.labelKey)}
            </p>
            <ul className="space-y-0.5">
              {group.items.map(({ to, labelKey, Icon }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    end={to === "/admin"}
                    className={({ isActive }) =>
                      `group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                        isActive
                          ? "bg-white text-[color:var(--color-gt-brand-blue)] font-semibold shadow-[0_6px_18px_-8px_rgba(0,0,0,0.5)]"
                          : "text-white/80 hover:bg-white/10 hover:text-white"
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && (
                          <span className="gt-gold-gradient absolute -left-3 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full" aria-hidden />
                        )}
                        <Icon className="h-[18px] w-[18px] shrink-0" aria-hidden />
                        <span className="flex-1 truncate">{t(labelKey)}</span>
                        {to === "/admin/contacts" && unread > 0 && (
                          <span className="rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold tabular-nums text-white">
                            {unread}
                          </span>
                        )}
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
      <div className="space-y-2 border-t border-white/10 p-3">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-sm font-medium text-white/95 transition hover:bg-white/12"
        >
          <IoGlobeOutline className="h-5 w-5" aria-hidden />
          {t("admin.viewSite")}
        </a>
        <LanguageSwitcher variant="dark" />
        <button
          type="button"
          onClick={logout}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-sm font-medium text-white/95 transition hover:border-red-400/40 hover:bg-red-500/20"
        >
          <IoLogOutOutline className="h-5 w-5" aria-hidden />
          {t("admin.logout")}
        </button>
      </div>
    </div>
  );

  return (
    <AdminFeedbackProvider>
      <div className="flex min-h-screen bg-[#f3f6fb]">
        <aside className="sticky top-0 hidden h-screen w-[272px] shrink-0 bg-[linear-gradient(175deg,#032a7a_0%,#021c5c_50%,#010f3a_100%)] text-white shadow-[4px_0_24px_rgba(1,15,58,0.18)] md:block">
          {sidebar}
        </aside>

        {drawerOpen && (
          <div className="fixed inset-0 z-[60] md:hidden">
            <div className="absolute inset-0 bg-[#010f3a]/60 backdrop-blur-[2px]" onClick={() => setDrawerOpen(false)} />
            <aside className="gt-fade-up absolute inset-y-0 left-0 w-[284px] max-w-[85vw] bg-[linear-gradient(175deg,#032a7a_0%,#021c5c_50%,#010f3a_100%)] text-white shadow-2xl">
              {sidebar}
            </aside>
          </div>
        )}

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
            <div className="flex items-center gap-3 px-4 py-3 md:px-8">
              <button
                type="button"
                className="rounded-lg p-2 text-[color:var(--color-gt-brand-blue)] hover:bg-slate-100 md:hidden"
                onClick={() => setDrawerOpen(true)}
                aria-label={t("admin.openMenu")}
              >
                <IoMenu className="h-6 w-6" />
              </button>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                  <span>{t("admin.sidebarKicker")}</span>
                  <IoChevronForward className="h-3 w-3" aria-hidden />
                  <span className="truncate text-slate-700">{current ? t(current.labelKey) : ""}</span>
                </div>
                {current && <p className="mt-0.5 hidden truncate text-xs text-slate-400 lg:block">{t(current.hintKey)}</p>}
              </div>
              <NotificationBell data={notifications.data} />
              <div className="hidden h-8 w-px bg-slate-200 sm:block" />
              <div className="hidden items-center gap-3 sm:flex">
                <span className="gt-brand-blue-bg flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold uppercase text-white ring-2 ring-[color:var(--color-gt-gold-bright)]/60">
                  {me.data?.email?.[0] ?? "A"}
                </span>
                <div className="hidden leading-tight lg:block">
                  <p className="max-w-[200px] truncate text-sm font-semibold text-[color:var(--color-gt-navy)]">{me.data?.email ?? "…"}</p>
                  <p className="text-xs text-slate-500">{roleName ?? t("admin.sidebarKicker")}</p>
                </div>
              </div>
            </div>
          </header>
          <main className="flex-1 p-4 md:p-8">
            <div className="mx-auto w-full max-w-7xl">
              <Outlet />
            </div>
          </main>
          <footer className="border-t border-slate-200/80 px-4 py-4 text-center text-xs text-slate-400 md:px-8">
            Global Transit and Transport Services — {t("admin.footerNote")}
          </footer>
        </div>
      </div>
    </AdminFeedbackProvider>
  );
}

function NotificationBell({ data }: { data?: Notifications }) {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const unread = data?.unread ?? 0;

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative rounded-full p-2.5 text-slate-600 transition hover:bg-slate-100 hover:text-[color:var(--color-gt-brand-blue)]"
        aria-label={t("admin.notificationsAria", { count: unread })}
        aria-expanded={open}
      >
        <IoNotificationsOutline className="h-[22px] w-[22px]" />
        {unread > 0 && (
          <span className="absolute right-1 top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white ring-2 ring-white">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>
      {open && (
        <div className="gt-toast-in absolute right-0 top-full z-50 mt-2 w-[min(92vw,360px)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_24px_48px_-16px_rgba(7,26,69,0.35)]">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <p className="text-sm font-semibold text-[color:var(--color-gt-navy)]">{t("admin.notificationsTitle")}</p>
            {unread > 0 && (
              <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-700">
                {t("admin.notificationsUnread", { count: unread })}
              </span>
            )}
          </div>
          {!data || data.items.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-slate-500">{t("admin.notificationsEmpty")}</p>
          ) : (
            <ul className="max-h-80 divide-y divide-slate-100 overflow-y-auto">
              {data.items.map((n) => (
                <li key={n.id}>
                  <Link
                    to="/admin/contacts"
                    onClick={() => setOpen(false)}
                    className="flex gap-3 px-4 py-3 transition hover:bg-slate-50"
                  >
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[color:var(--color-gt-brand-blue)]">
                      <IoMailUnreadOutline className="h-4 w-4" aria-hidden />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-[color:var(--color-gt-navy)]">{n.fullName}</span>
                      <span className="block truncate text-xs text-slate-500">
                        {n.service ? `${n.service} · ` : ""}
                        {n.email}
                      </span>
                    </span>
                    <time className="shrink-0 text-[11px] text-slate-400" dateTime={n.at}>
                      {formatRelativePast(new Date(n.at), i18n.language, t("admin.justNow"))}
                    </time>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <Link
            to="/admin/contacts"
            onClick={() => setOpen(false)}
            className="block border-t border-slate-100 bg-slate-50 px-4 py-2.5 text-center text-sm font-semibold text-[color:var(--color-gt-brand-blue)] hover:bg-slate-100"
          >
            {t("admin.notificationsSeeAll")}
          </Link>
        </div>
      )}
    </div>
  );
}

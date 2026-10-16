import { useMemo, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import type { IconType } from "react-icons";
import {
  IoAddCircleOutline,
  IoArrowDown,
  IoArrowForward,
  IoArrowUp,
  IoBusinessOutline,
  IoCubeOutline,
  IoDesktopOutline,
  IoDocumentTextOutline,
  IoEyeOutline,
  IoFolderOpenOutline,
  IoLinkOutline,
  IoMailOutline,
  IoNewspaperOutline,
  IoPeopleOutline,
  IoPersonOutline,
  IoPhonePortraitOutline,
  IoPulseOutline,
  IoRefresh,
  IoServerOutline,
  IoTabletPortraitOutline,
  IoTimeOutline,
} from "react-icons/io5";
import { Area, Bar, BarChart, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { apiFetch } from "@/api/client";
import { buildLast6MonthKeys, normalizeDashboard, type DashboardData } from "./dashboardNormalize";

export type { DashboardData } from "./dashboardNormalize";

/** Palette des graphiques (validée daltonisme) : série 1 bleu de marque, série 2 or. */
const SERIES_1 = "#0a4fc4";
const SERIES_2 = "#d99a0b";
const GRID = "#e6ebf3";
const AXIS_TEXT = "#64748b";

function errMessage(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}

function useFormatters(locale: string) {
  return useMemo(() => {
    const nf = new Intl.NumberFormat(locale);
    return {
      n: (v: number) => nf.format(v),
      day: (key: string) => {
        const [y, m, d] = key.split("-").map(Number);
        if (!y || !m || !d) return key;
        return new Date(y, m - 1, d).toLocaleDateString(locale, { day: "numeric", month: "short" });
      },
      month: (key: string) => {
        const [y, m] = key.split("-").map(Number);
        if (!y || !m) return key;
        return new Date(y, m - 1, 1).toLocaleDateString(locale, { month: "short", year: "2-digit" });
      },
      dateTime: (iso: string) => new Date(iso).toLocaleString(locale, { dateStyle: "medium", timeStyle: "short" }),
      time: (ms: number) => new Date(ms).toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" }),
    };
  }, [locale]);
}

/* ——— Briques d'interface ——— */

function Card({ title, subtitle, action, children, className = "" }: { title: string; subtitle?: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(7,26,69,0.04),0_8px_24px_-12px_rgba(7,26,69,0.12)] md:p-6 ${className}`}>
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-[color:var(--color-gt-navy)]">{title}</h2>
          {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function Delta({ current, previous }: { current: number; previous: number }) {
  const { t } = useTranslation();
  if (current === 0 && previous === 0) return <span className="text-xs text-slate-400">{t("admin.overview.noComparison")}</span>;
  if (previous === 0)
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
        <IoArrowUp className="h-3 w-3" aria-hidden />
        {t("admin.overview.new")}
      </span>
    );
  const pct = Math.round(((current - previous) / previous) * 100);
  const up = pct >= 0;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${up ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}
      title={t("admin.overview.vsPrevious")}
    >
      {up ? <IoArrowUp className="h-3 w-3" aria-hidden /> : <IoArrowDown className="h-3 w-3" aria-hidden />}
      {up ? "+" : ""}
      {pct} %
    </span>
  );
}

function KpiTile({ Icon, label, value, footer, accent = false }: { Icon: IconType; label: string; value: string; footer: ReactNode; accent?: boolean }) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border p-5 shadow-[0_8px_24px_-14px_rgba(7,26,69,0.25)] ${
        accent ? "gt-brand-blue-bg border-transparent text-white" : "border-slate-200/80 bg-white"
      }`}
    >
      {accent && <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[color:var(--color-gt-gold-bright)]/20 blur-2xl" aria-hidden />}
      <div className="flex items-center justify-between gap-3">
        <p className={`text-xs font-semibold uppercase tracking-wider ${accent ? "text-white/75" : "text-slate-500"}`}>{label}</p>
        <span
          className={`flex h-9 w-9 items-center justify-center rounded-xl ${
            accent ? "bg-white/15 text-[color:var(--color-gt-gold-bright)]" : "bg-blue-50 text-[color:var(--color-gt-brand-blue)]"
          }`}
        >
          <Icon className="h-5 w-5" aria-hidden />
        </span>
      </div>
      <p className={`mt-3 text-[2rem] font-bold leading-none tabular-nums ${accent ? "text-white" : "text-[color:var(--color-gt-navy)]"}`}>{value}</p>
      <div className={`mt-3 flex flex-wrap items-center gap-2 text-xs ${accent ? "text-white/75" : "text-slate-500"}`}>{footer}</div>
    </div>
  );
}

function BarList({ rows, format, empty }: { rows: { key: string; label: ReactNode; value: number }[]; format: (n: number) => string; empty: string }) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  const total = rows.reduce((s, r) => s + r.value, 0);
  if (rows.length === 0 || total === 0) return <p className="py-6 text-center text-sm text-slate-500">{empty}</p>;
  return (
    <ul className="space-y-3">
      {rows.map((r) => (
        <li key={r.key} className="group" title={`${format(r.value)} (${Math.round((r.value / total) * 100)} %)`}>
          <div className="mb-1.5 flex items-baseline justify-between gap-3 text-sm">
            <span className="min-w-0 truncate text-slate-700">{r.label}</span>
            <span className="shrink-0 tabular-nums">
              <span className="font-semibold text-[color:var(--color-gt-navy)]">{format(r.value)}</span>
              <span className="ml-1.5 text-xs text-slate-400">{Math.round((r.value / total) * 100)} %</span>
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full transition-[filter] group-hover:brightness-110" style={{ width: `${(r.value / max) * 100}%`, background: SERIES_1 }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

type TooltipRow = { name?: string | number; value?: unknown; color?: string; dataKey?: unknown };

function ChartTooltip({ active, payload, label, labelFormat, format }: { active?: boolean; payload?: readonly TooltipRow[]; label?: unknown; labelFormat: (k: string) => string; format: (n: number) => string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="min-w-[160px] rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 shadow-lg">
      <p className="mb-1.5 text-xs font-semibold text-slate-500">{labelFormat(String(label ?? ""))}</p>
      {payload.map((p) => (
        <p key={String(p.dataKey)} className="flex items-center justify-between gap-4 text-sm">
          <span className="flex items-center gap-2 text-slate-600">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: p.color }} aria-hidden />
            {p.name}
          </span>
          <span className="font-semibold tabular-nums text-[color:var(--color-gt-navy)]">{format(Number(p.value) || 0)}</span>
        </p>
      ))}
    </div>
  );
}

function Legend({ items }: { items: { label: string; color: string; line?: boolean }[] }) {
  return (
    <ul className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
      {items.map((it) => (
        <li key={it.label} className="flex items-center gap-2">
          {it.line ? (
            <span className="h-0.5 w-4 rounded-full" style={{ background: it.color }} aria-hidden />
          ) : (
            <span className="h-2.5 w-2.5 rounded-sm" style={{ background: it.color }} aria-hidden />
          )}
          {it.label}
        </li>
      ))}
    </ul>
  );
}

/* ——— Page ——— */

const PAGE_KEYS: Record<string, string> = {
  "/": "home",
  "/a-propos": "about",
  "/equipe": "team",
  "/activites": "services",
  "/projets": "projects",
  "/infrastructures": "infrastructure",
  "/actualites": "news",
  "/contact": "contact",
};

export function AdminDashboard() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language || "fr";
  const f = useFormatters(locale);

  const { data: raw, isPending, isError, error, isSuccess, refetch, isFetching, dataUpdatedAt } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: () => apiFetch<unknown>("/api/admin/dashboard"),
    refetchInterval: 5 * 60_000,
  });

  const data = useMemo(() => normalizeDashboard(raw), [raw]);
  const v = data.visits;

  const monthlyRows = useMemo(() => {
    const contactMap = new Map(data.contactsByMonth.map((r) => [r.monthKey, r.count]));
    const newsMap = new Map(data.newsByMonth.map((r) => [r.monthKey, r.count]));
    return buildLast6MonthKeys().map((monthKey) => ({
      monthKey,
      contacts: contactMap.get(monthKey) ?? 0,
      news: newsMap.get(monthKey) ?? 0,
    }));
  }, [data.contactsByMonth, data.newsByMonth]);

  function pageLabel(path: string) {
    const key = PAGE_KEYS[path];
    if (key) return t(`admin.pages.${key}`);
    const detail = path.match(/^\/(projets|actualites)\/(.+)$/);
    if (detail) {
      const kind = detail[1] === "projets" ? t("admin.pages.projectDetail") : t("admin.pages.newsDetail");
      return `${kind} · ${decodeURIComponent(detail[2]!).replace(/-/g, " ")}`;
    }
    return path;
  }

  const deviceMeta: Record<string, { Icon: IconType; label: string }> = {
    desktop: { Icon: IoDesktopOutline, label: t("admin.overview.deviceDesktop") },
    mobile: { Icon: IoPhonePortraitOutline, label: t("admin.overview.deviceMobile") },
    tablet: { Icon: IoTabletPortraitOutline, label: t("admin.overview.deviceTablet") },
  };

  const directSessions = Math.max(0, v.sessions30d - v.referredSessions30d);
  const noAudience = v.pageViews30d === 0 && v.pageViewsTotal === 0;

  const inventory: { Icon: IconType; label: string; value: number; detail: string; to: string }[] = [
    { Icon: IoLinkOutline, label: t("admin.nav.partners"), value: data.partnersCount, detail: t("admin.overview.partnersDetail"), to: "/admin/partners" },
    {
      Icon: IoCubeOutline,
      label: t("admin.nav.services"),
      value: data.servicesTotal,
      detail: t("admin.overview.publishedOf", { published: data.servicesPublished, total: data.servicesTotal }),
      to: "/admin/activity-services",
    },
    {
      Icon: IoNewspaperOutline,
      label: t("admin.overview.publications"),
      value: data.newsCount,
      detail: t("admin.overview.onlineDrafts", { online: data.newsPublished, drafts: Math.max(0, data.newsCount - data.newsPublished) }),
      to: "/admin/news",
    },
    {
      Icon: IoFolderOpenOutline,
      label: t("admin.nav.projects"),
      value: data.projectsCount,
      detail: t("admin.overview.featured", { count: data.projectsFeatured }),
      to: "/admin/projects",
    },
    { Icon: IoBusinessOutline, label: t("admin.nav.clients"), value: data.clientsCount, detail: t("admin.overview.clientsDetail"), to: "/admin/clients" },
    { Icon: IoServerOutline, label: t("admin.nav.infrastructure"), value: data.infrastructuresCount, detail: t("admin.overview.infraDetail"), to: "/admin/infrastructures" },
    { Icon: IoPeopleOutline, label: t("admin.nav.team"), value: data.teamCount, detail: t("admin.overview.teamDetail"), to: "/admin/team" },
    {
      Icon: IoPersonOutline,
      label: t("admin.nav.users"),
      value: data.usersCount,
      detail: t("admin.overview.rolesDetail", { count: data.rolesCount }),
      to: "/admin/users",
    },
  ];

  const activityIcon: Record<DashboardData["recentActivity"][number]["kind"], IconType> = {
    contact: IoMailOutline,
    news: IoNewspaperOutline,
    project: IoFolderOpenOutline,
    career: IoDocumentTextOutline,
  };
  const activityLabel: Record<DashboardData["recentActivity"][number]["kind"], string> = {
    contact: t("admin.activityContact"),
    news: t("admin.activityNews"),
    project: t("admin.activityProject"),
    career: t("admin.activityCareer"),
  };

  if (isPending) {
    return (
      <div className="space-y-6" aria-busy="true">
        <div className="h-16 w-2/3 animate-pulse rounded-2xl bg-slate-200/70" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-36 animate-pulse rounded-2xl bg-slate-200/70" />
          ))}
        </div>
        <div className="h-80 animate-pulse rounded-2xl bg-slate-200/70" />
        <p className="sr-only">{t("admin.loading")}</p>
      </div>
    );
  }

  const contactsTotal = Math.max(1, data.contactsTotal);
  const statusSegments = [
    { key: "new", label: t("admin.dashNewContacts"), value: data.contactsNew, color: "#dc2626" },
    { key: "read", label: t("admin.dashContactsRead"), value: data.contactsRead, color: SERIES_1 },
    { key: "archived", label: t("admin.dashContactsArchived"), value: data.contactsArchived, color: "#94a3b8" },
  ];

  return (
    <div className="space-y-8">
      {/* En-tête */}
      <header className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--color-gt-gold)]">
            {new Date().toLocaleDateString(locale, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
          <h1 className="mt-2 font-[family-name:var(--font-display)] text-[1.75rem] font-bold text-[color:var(--color-gt-navy)] md:text-3xl">
            {t("admin.dashboardTitle")}
          </h1>
          <p className="mt-1.5 max-w-2xl text-sm text-slate-500">{t("admin.overview.subtitle")}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/admin/news"
            className="gt-brand-blue-bg inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-900/15 transition hover:brightness-110"
          >
            <IoAddCircleOutline className="h-5 w-5" aria-hidden />
            {t("admin.overview.actionNews")}
          </Link>
          <Link
            to="/admin/partners"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-[color:var(--color-gt-brand-blue)] shadow-sm transition hover:bg-slate-50"
          >
            <IoLinkOutline className="h-5 w-5" aria-hidden />
            {t("admin.overview.actionPartner")}
          </Link>
          <Link
            to="/admin/contacts"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-[color:var(--color-gt-brand-blue)] shadow-sm transition hover:bg-slate-50"
          >
            <IoMailOutline className="h-5 w-5" aria-hidden />
            {t("admin.overview.actionMessages")}
            {data.contactsNew > 0 && <span className="rounded-full bg-red-500 px-1.5 text-[11px] font-bold text-white">{data.contactsNew}</span>}
          </Link>
          <button
            type="button"
            onClick={() => void refetch()}
            className="inline-flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-medium text-slate-500 transition hover:bg-white hover:text-slate-800"
            title={t("admin.overview.refresh")}
          >
            <IoRefresh className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} aria-hidden />
            {t("admin.overview.updatedAt", { time: f.time(dataUpdatedAt) })}
          </button>
        </div>
      </header>

      {isError ? (
        <div role="alert" className="rounded-2xl border border-red-200 bg-red-50/90 px-4 py-3 text-sm text-red-900 shadow-sm">
          <p className="font-semibold">{t("admin.dashLoadErrorTitle")}</p>
          <p className="mt-1 text-red-800/95">{errMessage(error)}</p>
          <p className="mt-2 text-xs text-red-800/80">{t("admin.dashLoadErrorHint")}</p>
        </div>
      ) : null}
      {!isError && isSuccess && raw === null ? <p className="text-sm text-amber-800">{t("admin.dashEmptyResponse")}</p> : null}

      {/* Audience */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiTile
          accent
          Icon={IoPulseOutline}
          label={t("admin.overview.visitorsToday")}
          value={f.n(v.visitorsToday)}
          footer={t("admin.overview.pageViewsToday", { count: v.pageViewsToday, formatted: f.n(v.pageViewsToday) })}
        />
        <KpiTile
          Icon={IoTimeOutline}
          label={t("admin.overview.sessions30")}
          value={f.n(v.sessions30d)}
          footer={
            <>
              <Delta current={v.sessions30d} previous={v.sessionsPrev30d} />
              <span>{t("admin.overview.vsPrevious")}</span>
            </>
          }
        />
        <KpiTile
          Icon={IoPeopleOutline}
          label={t("admin.overview.visitors30")}
          value={f.n(v.visitors30d)}
          footer={
            <>
              <Delta current={v.visitors30d} previous={v.visitorsPrev30d} />
              <span>{t("admin.overview.vsPrevious")}</span>
            </>
          }
        />
        <KpiTile
          Icon={IoEyeOutline}
          label={t("admin.overview.pageViews30")}
          value={f.n(v.pageViews30d)}
          footer={
            <>
              <Delta current={v.pageViews30d} previous={v.pageViewsPrev30d} />
              <span>{t("admin.overview.totalViews", { total: f.n(v.pageViewsTotal) })}</span>
            </>
          }
        />
      </div>

      <Card
        title={t("admin.overview.audienceTitle")}
        subtitle={t("admin.overview.audienceHint")}
        action={
          <Legend
            items={[
              { label: t("admin.overview.seriesPageViews"), color: SERIES_1 },
              { label: t("admin.overview.seriesVisitors"), color: SERIES_2, line: true },
            ]}
          />
        }
      >
        <div className="relative h-[300px] w-full min-w-0">
          {noAudience && (
            <div className="absolute inset-0 z-10 flex items-center justify-center">
              <p className="max-w-sm rounded-xl border border-dashed border-slate-300 bg-white/90 px-5 py-4 text-center text-sm text-slate-500">
                {t("admin.overview.noAudience")}
              </p>
            </div>
          )}
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={v.visitsByDay} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
              <defs>
                <linearGradient id="gt-area" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0" stopColor={SERIES_1} stopOpacity={0.28} />
                  <stop offset="1" stopColor={SERIES_1} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke={GRID} vertical={false} />
              <XAxis
                dataKey="day"
                tickFormatter={f.day}
                tick={{ fill: AXIS_TEXT, fontSize: 11 }}
                tickLine={false}
                axisLine={{ stroke: GRID }}
                minTickGap={24}
              />
              <YAxis allowDecimals={false} tick={{ fill: AXIS_TEXT, fontSize: 11 }} tickLine={false} axisLine={false} width={44} />
              <Tooltip
                cursor={{ stroke: "#94a3b8", strokeDasharray: "4 4" }}
                content={({ active, payload, label }) => (
                  <ChartTooltip active={active} payload={payload as readonly TooltipRow[]} label={label} labelFormat={f.day} format={f.n} />
                )}
              />
              <Area
                type="monotone"
                dataKey="pageViews"
                name={t("admin.overview.seriesPageViews")}
                stroke={SERIES_1}
                strokeWidth={2}
                fill="url(#gt-area)"
                activeDot={{ r: 5, stroke: "#fff", strokeWidth: 2 }}
              />
              <Line
                type="monotone"
                dataKey="visitors"
                name={t("admin.overview.seriesVisitors")}
                stroke={SERIES_2}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 5, stroke: "#fff", strokeWidth: 2 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card title={t("admin.overview.topPages")} subtitle={t("admin.overview.last30")}>
          <BarList
            rows={v.topPages.map((p) => ({ key: p.path, label: pageLabel(p.path), value: p.views }))}
            format={f.n}
            empty={t("admin.overview.noData")}
          />
        </Card>
        <Card title={t("admin.overview.devices")} subtitle={t("admin.overview.devicesHint")}>
          <BarList
            rows={v.devices.map((d) => {
              const meta = deviceMeta[d.device];
              return {
                key: d.device,
                label: (
                  <span className="inline-flex items-center gap-2">
                    {meta ? <meta.Icon className="h-4 w-4 text-slate-400" aria-hidden /> : null}
                    {meta?.label ?? d.device}
                  </span>
                ),
                value: d.count,
              };
            })}
            format={f.n}
            empty={t("admin.overview.noData")}
          />
        </Card>
        <Card title={t("admin.overview.sources")} subtitle={t("admin.overview.sourcesHint")}>
          <BarList
            rows={[
              { key: "__direct", label: t("admin.overview.direct"), value: directSessions },
              ...v.referrers.map((r) => ({ key: r.source, label: r.source, value: r.count })),
            ].filter((r) => r.value > 0)}
            format={f.n}
            empty={t("admin.overview.noData")}
          />
        </Card>
      </div>

      {/* Contenu du site */}
      <section>
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-[color:var(--color-gt-navy)]">{t("admin.overview.contentTitle")}</h2>
            <p className="mt-1 text-sm text-slate-500">{t("admin.overview.contentHint")}</p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {inventory.map((it) => (
            <Link
              key={it.to}
              to={it.to}
              className="group flex items-center gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_1px_2px_rgba(7,26,69,0.04)] transition hover:-translate-y-0.5 hover:border-[color:var(--color-gt-brand-blue-light)]/40 hover:shadow-[0_14px_30px_-14px_rgba(7,26,69,0.3)]"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#eef3fc] text-[color:var(--color-gt-brand-blue)] transition group-hover:bg-[color:var(--color-gt-brand-blue)] group-hover:text-white">
                <it.Icon className="h-6 w-6" aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-xs font-semibold uppercase tracking-wide text-slate-500">{it.label}</span>
                <span className="block text-2xl font-bold tabular-nums text-[color:var(--color-gt-navy)]">{f.n(it.value)}</span>
                <span className="block truncate text-xs text-slate-500">{it.detail}</span>
              </span>
              <IoArrowForward className="h-4 w-4 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-[color:var(--color-gt-brand-blue)]" aria-hidden />
            </Link>
          ))}
        </div>
      </section>

      {/* Messages & publications */}
      <div className="grid gap-6 lg:grid-cols-5">
        <Card
          className="lg:col-span-3"
          title={t("admin.chartSection")}
          subtitle={t("admin.chartHint")}
          action={
            <Legend
              items={[
                { label: t("admin.chartContacts"), color: SERIES_1 },
                { label: t("admin.chartNews"), color: SERIES_2 },
              ]}
            />
          }
        >
          <div className="h-[260px] w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyRows} margin={{ top: 8, right: 8, left: -8, bottom: 0 }} barGap={2} barCategoryGap="28%">
                <CartesianGrid stroke={GRID} vertical={false} />
                <XAxis dataKey="monthKey" tickFormatter={f.month} tick={{ fill: AXIS_TEXT, fontSize: 11 }} tickLine={false} axisLine={{ stroke: GRID }} />
                <YAxis allowDecimals={false} tick={{ fill: AXIS_TEXT, fontSize: 11 }} tickLine={false} axisLine={false} width={44} />
                <Tooltip
                  cursor={{ fill: "rgba(10,79,196,0.06)" }}
                  content={({ active, payload, label }) => (
                    <ChartTooltip active={active} payload={payload as readonly TooltipRow[]} label={label} labelFormat={f.month} format={f.n} />
                  )}
                />
                <Bar dataKey="contacts" name={t("admin.chartContacts")} fill={SERIES_1} radius={[4, 4, 0, 0]} maxBarSize={28} />
                <Bar dataKey="news" name={t("admin.chartNews")} fill={SERIES_2} radius={[4, 4, 0, 0]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card
          className="lg:col-span-2"
          title={t("admin.overview.inboxTitle")}
          subtitle={t("admin.overview.inboxHint", { total: f.n(data.contactsTotal) })}
          action={
            <Link to="/admin/contacts" className="inline-flex items-center gap-1 text-sm font-semibold text-[color:var(--color-gt-brand-blue)] hover:underline">
              {t("admin.overview.open")}
              <IoArrowForward className="h-4 w-4" aria-hidden />
            </Link>
          }
        >
          <div className="flex h-3 gap-0.5 overflow-hidden rounded-full bg-slate-100" role="img" aria-label={t("admin.overview.inboxTitle")}>
            {statusSegments.map((s) =>
              s.value > 0 ? <span key={s.key} style={{ width: `${(s.value / contactsTotal) * 100}%`, background: s.color }} title={`${s.label} : ${s.value}`} /> : null
            )}
          </div>
          <ul className="mt-5 space-y-3">
            {statusSegments.map((s) => (
              <li key={s.key} className="flex items-center justify-between gap-3 text-sm">
                <span className="flex items-center gap-2.5 text-slate-600">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: s.color }} aria-hidden />
                  {s.label}
                </span>
                <span className="font-semibold tabular-nums text-[color:var(--color-gt-navy)]">{f.n(s.value)}</span>
              </li>
            ))}
          </ul>
          {data.contactsNew > 0 && (
            <p className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">{t("admin.overview.inboxAlert", { count: data.contactsNew })}</p>
          )}
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3" title={t("admin.activitySection")}>
          {data.recentActivity.length === 0 ? (
            <p className="text-sm text-slate-500">{t("admin.noActivity")}</p>
          ) : (
            <ol className="relative space-y-1 before:absolute before:bottom-3 before:left-[17px] before:top-3 before:w-px before:bg-slate-200">
              {data.recentActivity.map((item) => {
                const Icon = activityIcon[item.kind];
                return (
                  <li key={`${item.kind}-${item.id}`} className="relative flex gap-3 rounded-xl px-1 py-2 transition hover:bg-slate-50">
                    <span className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-[color:var(--color-gt-brand-blue)] ring-1 ring-slate-200">
                      <Icon className="h-4 w-4" aria-hidden />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-baseline gap-x-2">
                        <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{activityLabel[item.kind]}</span>
                        <time className="text-xs text-slate-400" dateTime={item.at}>
                          {f.dateTime(item.at)}
                        </time>
                      </div>
                      <p className="truncate text-sm font-medium text-[color:var(--color-gt-navy)]">{item.title || "—"}</p>
                      {item.subtitle ? <p className="truncate text-xs text-slate-500">{item.subtitle}</p> : null}
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </Card>

        <Card className="lg:col-span-2" title={t("admin.lastAccessSection")}>
          {data.lastLogins.length === 0 ? (
            <p className="text-sm text-slate-500">{t("admin.noLastLogins")}</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {data.lastLogins.map((row) => (
                <li key={row.email} className="flex items-center gap-3 py-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#eef3fc] text-sm font-bold uppercase text-[color:var(--color-gt-brand-blue)]">
                    {row.email[0]}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-[color:var(--color-gt-navy)]">{row.email}</span>
                    <span className="block text-xs text-slate-500">{row.lastLogin ? f.dateTime(row.lastLogin) : "—"}</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}

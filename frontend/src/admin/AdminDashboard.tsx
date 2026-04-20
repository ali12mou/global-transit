import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
  FaBriefcase,
  FaClock,
  FaEnvelope,
  FaFolderOpen,
  FaNewspaper,
  FaUsers,
} from "react-icons/fa6";
import { IoAnalyticsOutline } from "react-icons/io5";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { apiFetch } from "@/api/client";
import { buildLast6MonthKeys, normalizeDashboard, type DashboardData } from "./dashboardNormalize";

export type { DashboardData } from "./dashboardNormalize";

function formatMonthLabel(monthKey: string, locale: string) {
  const [y, m] = monthKey.split("-").map(Number);
  if (!y || !m) return monthKey;
  return new Date(y, m - 1, 1).toLocaleDateString(locale, { month: "short", year: "2-digit" });
}

function formatDateTime(iso: string, locale: string) {
  return new Date(iso).toLocaleString(locale, { dateStyle: "medium", timeStyle: "short" });
}

function errMessage(e: unknown): string {
  if (e instanceof Error) return e.message;
  return String(e);
}

function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string | number;
  tone: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-5 shadow-[0_2px_16px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(15,23,42,0.1)]">
      <div
        className={`absolute -right-6 -top-6 h-20 w-20 rounded-full bg-gradient-to-br opacity-15 blur-2xl transition group-hover:opacity-25 ${tone}`}
        aria-hidden
      />
      <div className={`mb-3 inline-flex h-1 w-8 rounded-full bg-gradient-to-r ${tone}`} aria-hidden />
      <div className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-1 text-2xl font-bold tabular-nums text-[color:var(--color-gt-navy)]">{value}</div>
    </div>
  );
}

export function AdminDashboard() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language || "fr";

  const { data: raw, isPending, isError, error, isSuccess } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: async () => {
      const json = await apiFetch<unknown>("/api/admin/dashboard");
      return json;
    },
  });

  const data = useMemo(() => normalizeDashboard(raw), [raw]);

  const chartRows = useMemo(() => {
    const contacts = data.contactsByMonth;
    const news = data.newsByMonth;
    const keys = buildLast6MonthKeys();
    const contactMap = new Map(contacts.map((r) => [r.monthKey, r.count]));
    const newsMap = new Map(news.map((r) => [r.monthKey, r.count]));
    return keys.map((monthKey) => ({
      monthKey,
      contacts: contactMap.get(monthKey) ?? 0,
      news: newsMap.get(monthKey) ?? 0,
    }));
  }, [data.contactsByMonth, data.newsByMonth]);

  const activityIcon = (kind: DashboardData["recentActivity"][number]["kind"]) => {
    const cls = "mt-0.5 h-4 w-4 shrink-0";
    switch (kind) {
      case "contact":
        return <FaEnvelope className={cls} aria-hidden />;
      case "news":
        return <FaNewspaper className={cls} aria-hidden />;
      case "project":
        return <FaFolderOpen className={cls} aria-hidden />;
      case "career":
        return <FaBriefcase className={cls} aria-hidden />;
      default:
        return null;
    }
  };

  const activityLabel = (kind: DashboardData["recentActivity"][number]["kind"]) => {
    switch (kind) {
      case "contact":
        return t("admin.activityContact");
      case "news":
        return t("admin.activityNews");
      case "project":
        return t("admin.activityProject");
      case "career":
        return t("admin.activityCareer");
      default:
        return "";
    }
  };

  const statTones = [
    "from-sky-600 to-[color:var(--color-gt-blue)]",
    "from-amber-600 to-amber-700",
    "from-emerald-600 to-[color:var(--color-gt-accent-green)]",
    "from-violet-600 to-violet-800",
    "from-slate-600 to-slate-800",
    "from-rose-600 to-rose-800",
    "from-cyan-600 to-cyan-800",
    "from-fuchsia-600 to-fuchsia-800",
  ];

  const summaryCards: { label: string; value: string | number; tone: string }[] = [
    { label: t("admin.dashNewContacts"), value: data.contactsNew, tone: statTones[0] },
    { label: t("admin.dashContactsTotal"), value: data.contactsTotal, tone: statTones[1] },
    { label: t("admin.dashContactsRead"), value: data.contactsRead, tone: statTones[2] },
    { label: t("admin.dashContactsArchived"), value: data.contactsArchived, tone: statTones[3] },
    { label: t("admin.dashNews"), value: data.newsCount, tone: statTones[0] },
    { label: t("admin.dashNewsPublished"), value: data.newsPublished, tone: statTones[1] },
    { label: t("admin.dashProjects"), value: data.projectsCount, tone: statTones[2] },
    { label: t("admin.dashProjectsFeatured"), value: data.projectsFeatured, tone: statTones[3] },
    { label: t("admin.dashCareers"), value: data.careersCount, tone: statTones[4] },
    { label: t("admin.dashCareersTotal"), value: data.careersTotal, tone: statTones[5] },
    { label: t("admin.dashPartners"), value: data.partnersCount, tone: statTones[0] },
    { label: t("admin.dashClients"), value: data.clientsCount, tone: statTones[1] },
    { label: t("admin.dashTeam"), value: data.teamCount, tone: statTones[2] },
    { label: t("admin.dashUsers"), value: data.usersCount, tone: statTones[3] },
    { label: t("admin.dashRoles"), value: data.rolesCount, tone: statTones[4] },
    {
      label: t("admin.dashServices"),
      value: `${data.servicesPublished} / ${data.servicesTotal}`,
      tone: statTones[5],
    },
    {
      label: t("admin.dashOperations"),
      value: `${data.operationsPublished} / ${data.operationsTotal}`,
      tone: statTones[6],
    },
  ];

  if (isPending) {
    return (
      <div className="rounded-2xl border border-slate-200/80 bg-white p-10 text-center shadow-sm">
        <p className="text-slate-600">{t("admin.loading")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <header>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-[color:var(--color-gt-navy)] md:text-3xl">
          {t("admin.dashboardTitle")}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-600">{t("admin.dashboardSubtitle")}</p>
      </header>

      {isError ? (
        <div
          role="alert"
          className="rounded-2xl border border-red-200 bg-red-50/90 px-4 py-3 text-sm text-red-900 shadow-sm"
        >
          <p className="font-semibold">{t("admin.dashLoadErrorTitle")}</p>
          <p className="mt-1 text-red-800/95">{errMessage(error)}</p>
          <p className="mt-2 text-xs text-red-800/80">{t("admin.dashLoadErrorHint")}</p>
        </div>
      ) : null}

      {!isError && isSuccess && raw === null ? (
        <p className="text-sm text-amber-800">{t("admin.dashEmptyResponse")}</p>
      ) : null}

      <section aria-labelledby="summary-heading" className="rounded-2xl border border-slate-200/80 bg-white/60 p-6 shadow-sm backdrop-blur-sm md:p-8">
        <div className="mb-5 flex items-center gap-2">
          <IoAnalyticsOutline className="h-6 w-6 text-[color:var(--color-gt-blue)]" aria-hidden />
          <h2 id="summary-heading" className="text-lg font-semibold text-[color:var(--color-gt-navy)]">
            {t("admin.summarySection")}
          </h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {summaryCards.map((c) => (
            <StatCard key={c.label} label={c.label} value={c.value} tone={c.tone} />
          ))}
        </div>
      </section>

      <section aria-labelledby="chart-heading" className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-[0_2px_16px_rgba(15,23,42,0.06)]">
        <h2 id="chart-heading" className="text-lg font-semibold text-[color:var(--color-gt-navy)]">
          {t("admin.chartSection")}
        </h2>
        <p className="mt-1 text-sm text-slate-600">{t("admin.chartHint")}</p>
        <div className="mt-6 h-[320px] w-full min-w-0 md:h-[340px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartRows} margin={{ top: 8, right: 12, left: 4, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="monthKey"
                tick={{ fill: "#64748b", fontSize: 11 }}
                tickFormatter={(k) => formatMonthLabel(String(k), locale)}
              />
              <YAxis tick={{ fill: "#64748b", fontSize: 11 }} allowDecimals={false} width={40} />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0" }}
                labelFormatter={(k) => formatMonthLabel(String(k), locale)}
              />
              <Legend />
              <Bar
                dataKey="contacts"
                name={t("admin.chartContacts")}
                fill="var(--color-gt-blue)"
                radius={[4, 4, 0, 0]}
                maxBarSize={44}
              />
              <Line
                type="monotone"
                dataKey="news"
                name={t("admin.chartNews")}
                stroke="var(--color-gt-gold)"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-2">
        <section
          aria-labelledby="last-access-heading"
          className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-[0_2px_16px_rgba(15,23,42,0.06)]"
        >
          <div className="mb-4 flex items-center gap-2">
            <FaUsers className="h-5 w-5 text-[color:var(--color-gt-blue)]" aria-hidden />
            <h2 id="last-access-heading" className="text-lg font-semibold text-[color:var(--color-gt-navy)]">
              {t("admin.lastAccessSection")}
            </h2>
          </div>
          {data.lastLogins.length === 0 ? (
            <p className="text-sm text-slate-500">{t("admin.noLastLogins")}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                    <th className="pb-2 pr-3 font-medium">{t("admin.tableEmail")}</th>
                    <th className="pb-2 font-medium">{t("admin.tableLastLogin")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.lastLogins.map((row) => (
                    <tr key={row.email} className="text-slate-800">
                      <td className="py-2.5 pr-3 font-mono text-xs">{row.email}</td>
                      <td className="py-2.5 text-slate-600">
                        {row.lastLogin ? formatDateTime(row.lastLogin, locale) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section
          aria-labelledby="activity-heading"
          className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-[0_2px_16px_rgba(15,23,42,0.06)]"
        >
          <div className="mb-4 flex items-center gap-2">
            <FaClock className="h-5 w-5 text-[color:var(--color-gt-blue)]" aria-hidden />
            <h2 id="activity-heading" className="text-lg font-semibold text-[color:var(--color-gt-navy)]">
              {t("admin.activitySection")}
            </h2>
          </div>
          {data.recentActivity.length === 0 ? (
            <p className="text-sm text-slate-500">{t("admin.noActivity")}</p>
          ) : (
            <ul className="space-y-3">
              {data.recentActivity.map((item) => (
                <li
                  key={`${item.kind}-${item.id}`}
                  className="flex gap-3 rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2.5"
                >
                  <span className="text-[color:var(--color-gt-blue)]">{activityIcon(item.kind)}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                      <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        {activityLabel(item.kind)}
                      </span>
                      <time className="text-xs text-slate-400" dateTime={item.at}>
                        {formatDateTime(item.at, locale)}
                      </time>
                    </div>
                    <p className="truncate font-medium text-[color:var(--color-gt-navy)]">{item.title || "—"}</p>
                    {item.subtitle ? (
                      <p className="truncate text-xs text-slate-600">{item.subtitle}</p>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

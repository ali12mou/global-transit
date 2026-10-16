export type VisitStats = {
  pageViewsToday: number;
  visitorsToday: number;
  pageViews30d: number;
  pageViewsPrev30d: number;
  sessions30d: number;
  sessionsPrev30d: number;
  visitors30d: number;
  visitorsPrev30d: number;
  pageViewsTotal: number;
  referredSessions30d: number;
  visitsByDay: { day: string; pageViews: number; visitors: number }[];
  topPages: { path: string; views: number }[];
  devices: { device: string; count: number }[];
  referrers: { source: string; count: number }[];
};

export type DashboardData = {
  contactsNew: number;
  contactsTotal: number;
  contactsRead: number;
  contactsArchived: number;
  newsCount: number;
  newsPublished: number;
  projectsCount: number;
  projectsFeatured: number;
  careersCount: number;
  careersTotal: number;
  partnersCount: number;
  clientsCount: number;
  teamCount: number;
  servicesPublished: number;
  servicesTotal: number;
  operationsPublished: number;
  operationsTotal: number;
  usersCount: number;
  rolesCount: number;
  infrastructuresCount: number;
  visits: VisitStats;
  contactsByMonth: { monthKey: string; count: number }[];
  newsByMonth: { monthKey: string; count: number }[];
  lastLogins: { email: string; lastLogin: string | null }[];
  recentActivity: {
    id: string;
    kind: "contact" | "news" | "project" | "career";
    title: string;
    subtitle?: string;
    at: string;
  }[];
};

const EMPTY_VISITS: VisitStats = {
  pageViewsToday: 0,
  visitorsToday: 0,
  pageViews30d: 0,
  pageViewsPrev30d: 0,
  sessions30d: 0,
  sessionsPrev30d: 0,
  visitors30d: 0,
  visitorsPrev30d: 0,
  pageViewsTotal: 0,
  referredSessions30d: 0,
  visitsByDay: [],
  topPages: [],
  devices: [],
  referrers: [],
};

const EMPTY: DashboardData = {
  contactsNew: 0,
  contactsTotal: 0,
  contactsRead: 0,
  contactsArchived: 0,
  newsCount: 0,
  newsPublished: 0,
  projectsCount: 0,
  projectsFeatured: 0,
  careersCount: 0,
  careersTotal: 0,
  partnersCount: 0,
  clientsCount: 0,
  teamCount: 0,
  servicesPublished: 0,
  servicesTotal: 0,
  operationsPublished: 0,
  operationsTotal: 0,
  usersCount: 0,
  rolesCount: 0,
  infrastructuresCount: 0,
  visits: EMPTY_VISITS,
  contactsByMonth: [],
  newsByMonth: [],
  lastLogins: [],
  recentActivity: [],
};

function isMonthRow(x: unknown): x is { monthKey: string; count: number } {
  return (
    !!x &&
    typeof x === "object" &&
    typeof (x as { monthKey?: string }).monthKey === "string" &&
    typeof (x as { count?: number }).count === "number"
  );
}

function isActivity(x: unknown): x is DashboardData["recentActivity"][number] {
  if (!x || typeof x !== "object") return false;
  const o = x as Record<string, unknown>;
  const kind = o.kind;
  return (
    typeof o.id === "string" &&
    (kind === "contact" || kind === "news" || kind === "project" || kind === "career") &&
    typeof o.title === "string" &&
    typeof o.at === "string"
  );
}

function isLogin(x: unknown): x is { email: string; lastLogin: string | null } {
  if (!x || typeof x !== "object") return false;
  const o = x as Record<string, unknown>;
  return typeof o.email === "string" && (o.lastLogin === null || typeof o.lastLogin === "string");
}

function isRecord(x: unknown): x is Record<string, unknown> {
  return !!x && typeof x === "object" && !Array.isArray(x);
}

function normalizeVisits(raw: unknown): VisitStats {
  if (!isRecord(raw)) return { ...EMPTY_VISITS };
  const num = (k: string) => (typeof raw[k] === "number" && Number.isFinite(raw[k]) ? (raw[k] as number) : 0);
  const rows = (k: string) => (Array.isArray(raw[k]) ? (raw[k] as unknown[]).filter(isRecord) : []);
  return {
    pageViewsToday: num("pageViewsToday"),
    visitorsToday: num("visitorsToday"),
    pageViews30d: num("pageViews30d"),
    pageViewsPrev30d: num("pageViewsPrev30d"),
    sessions30d: num("sessions30d"),
    sessionsPrev30d: num("sessionsPrev30d"),
    visitors30d: num("visitors30d"),
    visitorsPrev30d: num("visitorsPrev30d"),
    pageViewsTotal: num("pageViewsTotal"),
    referredSessions30d: num("referredSessions30d"),
    visitsByDay: rows("visitsByDay").map((r) => ({
      day: String(r.day ?? ""),
      pageViews: Number(r.pageViews) || 0,
      visitors: Number(r.visitors) || 0,
    })),
    topPages: rows("topPages").map((r) => ({ path: String(r.path ?? ""), views: Number(r.views) || 0 })),
    devices: rows("devices").map((r) => ({ device: String(r.device ?? ""), count: Number(r.count) || 0 })),
    referrers: rows("referrers").map((r) => ({ source: String(r.source ?? ""), count: Number(r.count) || 0 })),
  };
}

function filterArray<T>(raw: unknown, guard: (x: unknown) => x is T): T[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter(guard);
}

/** Réponse API partielle (ex. ancien backend) ou complète — évite tout crash si un champ manque. */
export function normalizeDashboard(raw: unknown): DashboardData {
  if (!raw || typeof raw !== "object") return { ...EMPTY };
  const r = raw as Record<string, unknown>;
  const num = (k: string) =>
    typeof r[k] === "number" && !Number.isNaN(r[k] as number) ? (r[k] as number) : 0;

  return {
    contactsNew: num("contactsNew"),
    contactsTotal: num("contactsTotal"),
    contactsRead: num("contactsRead"),
    contactsArchived: num("contactsArchived"),
    newsCount: num("newsCount"),
    newsPublished: num("newsPublished"),
    projectsCount: num("projectsCount"),
    projectsFeatured: num("projectsFeatured"),
    careersCount: num("careersCount"),
    careersTotal: num("careersTotal"),
    partnersCount: num("partnersCount"),
    clientsCount: num("clientsCount"),
    teamCount: num("teamCount"),
    servicesPublished: num("servicesPublished"),
    servicesTotal: num("servicesTotal"),
    operationsPublished: num("operationsPublished"),
    operationsTotal: num("operationsTotal"),
    usersCount: num("usersCount"),
    rolesCount: num("rolesCount"),
    infrastructuresCount: num("infrastructuresCount"),
    visits: normalizeVisits(r.visits),
    contactsByMonth: filterArray(r.contactsByMonth, isMonthRow),
    newsByMonth: filterArray(r.newsByMonth, isMonthRow),
    lastLogins: filterArray(r.lastLogins, isLogin),
    recentActivity: filterArray(r.recentActivity, isActivity),
  };
}

export function buildLast6MonthKeys(): string[] {
  const now = new Date();
  const keys: string[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    keys.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }
  return keys;
}

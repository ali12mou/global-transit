import { Visit } from "../models/Visit.js";

const DAY_MS = 24 * 60 * 60 * 1000;
/** Fuseau utilisé pour découper les journées (heure de Djibouti par défaut). */
const STATS_TIMEZONE = process.env.STATS_TIMEZONE ?? "Africa/Djibouti";

function dayKey(d: Date): string {
  // en-CA → AAAA-MM-JJ
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: STATS_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

async function countDistinct(field: "visitorId" | "sessionId", from: Date, to: Date): Promise<number> {
  const rows = await Visit.aggregate<{ n: number }>([
    { $match: { createdAt: { $gte: from, $lt: to } } },
    { $group: { _id: `$${field}` } },
    { $count: "n" },
  ]);
  return rows[0]?.n ?? 0;
}

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
  /** Sessions arrivées depuis un autre site (le reste = accès direct) */
  referredSessions30d: number;
  visitsByDay: { day: string; pageViews: number; visitors: number }[];
  topPages: { path: string; views: number }[];
  devices: { device: string; count: number }[];
  referrers: { source: string; count: number }[];
};

/** Statistiques d'audience : fenêtres glissantes de 30 jours + série journalière (30 jours calendaires). */
export async function buildVisitStats(now = new Date()): Promise<VisitStats> {
  const d30 = new Date(now.getTime() - 30 * DAY_MS);
  const d60 = new Date(now.getTime() - 60 * DAY_MS);
  const seriesFrom = new Date(now.getTime() - 31 * DAY_MS);
  const recent = { createdAt: { $gte: d30 } };

  const [
    pageViews30d,
    pageViewsPrev30d,
    sessions30d,
    sessionsPrev30d,
    visitors30d,
    visitorsPrev30d,
    pageViewsTotal,
    referredSessions30d,
    byDay,
    topPages,
    devices,
    referrers,
  ] = await Promise.all([
    Visit.countDocuments(recent),
    Visit.countDocuments({ createdAt: { $gte: d60, $lt: d30 } }),
    countDistinct("sessionId", d30, now),
    countDistinct("sessionId", d60, d30),
    countDistinct("visitorId", d30, now),
    countDistinct("visitorId", d60, d30),
    Visit.estimatedDocumentCount(),
    Visit.countDocuments({ ...recent, referrer: { $ne: "" } }),
    Visit.aggregate<{ _id: string; pageViews: number; visitors: string[] }>([
      { $match: { createdAt: { $gte: seriesFrom } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt", timezone: STATS_TIMEZONE } },
          pageViews: { $sum: 1 },
          visitors: { $addToSet: "$visitorId" },
        },
      },
    ]),
    Visit.aggregate<{ _id: string; views: number }>([
      { $match: recent },
      { $group: { _id: "$path", views: { $sum: 1 } } },
      { $sort: { views: -1 } },
      { $limit: 6 },
    ]),
    Visit.aggregate<{ _id: string; count: number }>([
      { $match: recent },
      { $group: { _id: "$device", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
    Visit.aggregate<{ _id: string; count: number }>([
      { $match: { ...recent, referrer: { $ne: "" } } },
      { $group: { _id: "$referrer", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]),
  ]);

  const dayMap = new Map(byDay.map((r) => [r._id, r]));
  const visitsByDay: VisitStats["visitsByDay"] = [];
  for (let i = 29; i >= 0; i--) {
    const key = dayKey(new Date(now.getTime() - i * DAY_MS));
    const row = dayMap.get(key);
    visitsByDay.push({ day: key, pageViews: row?.pageViews ?? 0, visitors: row?.visitors.length ?? 0 });
  }
  const today = visitsByDay[visitsByDay.length - 1]!;

  return {
    pageViewsToday: today.pageViews,
    visitorsToday: today.visitors,
    pageViews30d,
    pageViewsPrev30d,
    sessions30d,
    sessionsPrev30d,
    visitors30d,
    visitorsPrev30d,
    pageViewsTotal,
    referredSessions30d,
    visitsByDay,
    topPages: topPages.map((r) => ({ path: r._id, views: r.views })),
    devices: devices.map((r) => ({ device: r._id, count: r.count })),
    referrers: referrers.map((r) => ({ source: r._id, count: r.count })),
  };
}

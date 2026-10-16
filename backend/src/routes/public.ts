import { Router } from "express";
import { ActivityOperation } from "../models/ActivityOperation.js";
import { ActivityService } from "../models/ActivityService.js";
import { Career } from "../models/Career.js";
import { Client } from "../models/Client.js";
import { Partner } from "../models/Partner.js";
import { Project } from "../models/Project.js";
import { News } from "../models/News.js";
import { Team } from "../models/Team.js";
import { Configuration } from "../models/Configuration.js";
import { Infrastructure } from "../models/Infrastructure.js";

export const publicRouter = Router();

publicRouter.get("/config", async (_req, res, next) => {
  try {
    const rows = await Configuration.find();
    const map: Record<string, unknown> = {};
    for (const r of rows) {
      map[r.key] = r.value;
    }
    res.json(map);
  } catch (e) {
    next(e);
  }
});

publicRouter.get("/activity-operations", async (_req, res, next) => {
  try {
    const items = await ActivityOperation.find({ published: true }).sort({ order: 1, createdAt: -1 });
    res.json(items);
  } catch (e) {
    next(e);
  }
});

publicRouter.get("/activity-operations/:slug", async (req, res, next) => {
  try {
    const doc = await ActivityOperation.findOne({ slug: req.params.slug, published: true });
    if (!doc) {
      res.status(404).json({ error: "Non trouvé" });
      return;
    }
    res.json(doc);
  } catch (e) {
    next(e);
  }
});

publicRouter.get("/activity-services", async (_req, res, next) => {
  try {
    const items = await ActivityService.find({ published: true }).sort({ order: 1, createdAt: -1 });
    res.json(items);
  } catch (e) {
    next(e);
  }
});

publicRouter.get("/careers", async (_req, res, next) => {
  try {
    const items = await Career.find({ active: true }).sort({ publishedAt: -1, createdAt: -1 });
    res.json(items);
  } catch (e) {
    next(e);
  }
});

publicRouter.get("/clients", async (_req, res, next) => {
  try {
    const items = await Client.find().sort({ order: 1, createdAt: -1 });
    res.json(items);
  } catch (e) {
    next(e);
  }
});

publicRouter.get("/infrastructures", async (_req, res, next) => {
  try {
    const items = await Infrastructure.find().sort({ order: 1, createdAt: -1 });
    res.json(items);
  } catch (e) {
    next(e);
  }
});
publicRouter.get("/partners", async (_req, res, next) => {
  try {
    const items = await Partner.find().sort({ order: 1, createdAt: -1 });
    res.json(items);
  } catch (e) {
    next(e);
  }
});

publicRouter.get("/projects", async (req, res, next) => {
  try {
    const featured = req.query.featured === "true";
    const q: Record<string, unknown> = { published: true };
    if (featured) q.featured = true;
    const items = await Project.find(q).sort({ createdAt: -1 });
    res.json(items);
  } catch (e) {
    next(e);
  }
});

publicRouter.get("/projects/:slug", async (req, res, next) => {
  try {
    const doc = await Project.findOne({ slug: req.params.slug, published: true });
    if (!doc) {
      res.status(404).json({ error: "Non trouvé" });
      return;
    }
    res.json(doc);
  } catch (e) {
    next(e);
  }
});

publicRouter.get("/news", async (_req, res, next) => {
  try {
    const items = await News.find({ published: true }).sort({ publishedAt: -1, createdAt: -1 });
    res.json(items);
  } catch (e) {
    next(e);
  }
});

publicRouter.get("/news/:slug", async (req, res, next) => {
  try {
    const doc = await News.findOne({ slug: req.params.slug, published: true });
    if (!doc) {
      res.status(404).json({ error: "Non trouvé" });
      return;
    }
    res.json(doc);
  } catch (e) {
    next(e);
  }
});

publicRouter.get("/team", async (_req, res, next) => {
  try {
    const items = await Team.find()
      .select("order title name phone email website formation description imageUrl")
      .sort({ order: 1, createdAt: -1 })
      .lean();
    res.json(items);
  } catch (e) {
    next(e);
  }
});

/** Anti-abus léger : une même action (vue / j'aime) par adresse et par article toutes les 2 s. */
const recentHits = new Map<string, number>();
function isThrottled(key: string, windowMs = 2000): boolean {
  const now = Date.now();
  const last = recentHits.get(key) ?? 0;
  recentHits.set(key, now);
  if (recentHits.size > 5000) {
    for (const [k, at] of recentHits) if (now - at > windowMs) recentHits.delete(k);
  }
  return now - last < windowMs;
}

const COUNTERS = { views: 1, likes: 1 } as const;
/** Robots et navigateurs automatisés : ne comptent ni comme lecteurs ni comme « J'aime ». */
const BOT_UA = /bot|crawl|spider|slurp|preview|headless|lighthouse|curl|wget|python/i;
const isBot = (ua: unknown) => BOT_UA.test(String(ua ?? ""));

/** Compte une lecture d'article (le navigateur n'envoie qu'une vue par session). */
publicRouter.post("/news/:slug/view", async (req, res, next) => {
  try {
    const slug = req.params.slug;
    if (isBot(req.headers["user-agent"]) || isThrottled(`view:${req.ip}:${slug}`)) {
      res.json(await News.findOne({ slug, published: true }, COUNTERS).lean());
      return;
    }
    const doc = await News.findOneAndUpdate({ slug, published: true }, { $inc: { views: 1 } }, { new: true, projection: COUNTERS }).lean();
    if (!doc) {
      res.status(404).json({ error: "Non trouvé" });
      return;
    }
    res.json(doc);
  } catch (e) {
    next(e);
  }
});

/** « J'aime » / retrait du « J'aime » (body : { liked: boolean }). */
publicRouter.post("/news/:slug/like", async (req, res, next) => {
  try {
    const slug = req.params.slug;
    const liked = req.body?.liked !== false;
    if (isBot(req.headers["user-agent"])) {
      res.json(await News.findOne({ slug, published: true }, COUNTERS).lean());
      return;
    }
    if (isThrottled(`like:${req.ip}:${slug}`, 800)) {
      res.status(429).json({ error: "Trop de requêtes" });
      return;
    }
    const doc = liked
      ? await News.findOneAndUpdate({ slug, published: true }, { $inc: { likes: 1 } }, { new: true, projection: COUNTERS }).lean()
      : ((await News.findOneAndUpdate(
          { slug, published: true, likes: { $gt: 0 } },
          { $inc: { likes: -1 } },
          { new: true, projection: COUNTERS }
        ).lean()) ?? (await News.findOne({ slug, published: true }, COUNTERS).lean()));
    if (!doc) {
      res.status(404).json({ error: "Non trouvé" });
      return;
    }
    res.json(doc);
  } catch (e) {
    next(e);
  }
});

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
    const items = await Team.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (e) {
    next(e);
  }
});

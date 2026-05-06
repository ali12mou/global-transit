import { Router } from "express";
import bcrypt from "bcryptjs";
import type { Model } from "mongoose";
import { authRequired, type AuthedRequest } from "../middleware/auth.js";
import { requirePermission } from "../middleware/requirePermission.js";
import { ActivityOperation } from "../models/ActivityOperation.js";
import { ActivityService } from "../models/ActivityService.js";
import { Career } from "../models/Career.js";
import { Client } from "../models/Client.js";
import { Partner } from "../models/Partner.js";
import { Project } from "../models/Project.js";
import { News } from "../models/News.js";
import { Team } from "../models/Team.js";
import { Infrastructure } from "../models/Infrastructure.js";
import { Contact } from "../models/Contact.js";
import { Configuration } from "../models/Configuration.js";
import { User } from "../models/User.js";
import { Role } from "../models/Role.js";
import { slugify } from "../utils/slug.js";

export const adminRouter = Router();

function buildLast6MonthsSeries(
  agg: { _id: string; count: number }[],
  now: Date
): { monthKey: string; count: number }[] {
  const map = new Map(agg.map((x) => [x._id, x.count]));
  const out: { monthKey: string; count: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    out.push({ monthKey: key, count: map.get(key) ?? 0 });
  }
  return out;
}

adminRouter.get(
  "/dashboard",
  authRequired,
  requirePermission("dashboard.read"),
  async (_req, res, next) => {
    try {
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth() - 5, 1);

      const [
        contactsNew,
        contactsTotal,
        contactsRead,
        contactsArchived,
        newsCount,
        newsPublished,
        projectsCount,
        projectsFeatured,
        careersActive,
        careersTotal,
        partnersCount,
        clientsCount,
        teamCount,
        servicesPublished,
        servicesTotal,
        operationsPublished,
        operationsTotal,
        usersCount,
        rolesCount,
        contactsAgg,
        newsAgg,
        recentContacts,
        recentNews,
        recentProjects,
        recentCareers,
        lastLoginsRaw,
      ] = await Promise.all([
        Contact.countDocuments({ status: "new" }),
        Contact.countDocuments(),
        Contact.countDocuments({ status: "read" }),
        Contact.countDocuments({ status: "archived" }),
        News.countDocuments(),
        News.countDocuments({ published: true }),
        Project.countDocuments(),
        Project.countDocuments({ featured: true }),
        Career.countDocuments({ active: true }),
        Career.countDocuments(),
        Partner.countDocuments(),
        Client.countDocuments(),
        Team.countDocuments(),
        ActivityService.countDocuments({ published: true }),
        ActivityService.countDocuments(),
        ActivityOperation.countDocuments({ published: true }),
        ActivityOperation.countDocuments(),
        User.countDocuments({ active: true }),
        Role.countDocuments(),
        Contact.aggregate<{ _id: string; count: number }>([
          { $match: { createdAt: { $gte: monthStart } } },
          {
            $group: {
              _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
              count: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
        ]),
        News.aggregate<{ _id: string; count: number }>([
          { $match: { createdAt: { $gte: monthStart } } },
          {
            $group: {
              _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
              count: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
        ]),
        Contact.find().sort({ createdAt: -1 }).limit(6).select("fullName email createdAt").lean(),
        News.find().sort({ updatedAt: -1 }).limit(6).select("title slug updatedAt").lean(),
        Project.find().sort({ updatedAt: -1 }).limit(6).select("title slug updatedAt").lean(),
        Career.find().sort({ updatedAt: -1 }).limit(4).select("title updatedAt").lean(),
        User.find({ lastLogin: { $exists: true, $ne: null } })
          .sort({ lastLogin: -1 })
          .limit(8)
          .select("email lastLogin")
          .lean(),
      ]);

      const contactsByMonth = buildLast6MonthsSeries(contactsAgg, now);
      const newsByMonth = buildLast6MonthsSeries(newsAgg, now);

      type ActivityItem = {
        id: string;
        kind: "contact" | "news" | "project" | "career";
        title: string;
        subtitle?: string;
        at: string;
      };
      const activities: ActivityItem[] = [];
      for (const c of recentContacts) {
        activities.push({
          id: String(c._id),
          kind: "contact",
          title: String(c.fullName ?? ""),
          subtitle: String(c.email ?? ""),
          at: (c.createdAt as Date).toISOString(),
        });
      }
      for (const n of recentNews) {
        activities.push({
          id: String(n._id),
          kind: "news",
          title: String(n.title ?? ""),
          at: (n.updatedAt as Date).toISOString(),
        });
      }
      for (const p of recentProjects) {
        activities.push({
          id: String(p._id),
          kind: "project",
          title: String(p.title ?? ""),
          at: (p.updatedAt as Date).toISOString(),
        });
      }
      for (const cr of recentCareers) {
        activities.push({
          id: String(cr._id),
          kind: "career",
          title: String(cr.title ?? ""),
          at: (cr.updatedAt as Date).toISOString(),
        });
      }
      activities.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
      const recentActivity = activities.slice(0, 12);

      const lastLogins = lastLoginsRaw.map((u) => ({
        email: u.email,
        lastLogin: u.lastLogin ? (u.lastLogin as Date).toISOString() : null,
      }));

      res.json({
        contactsNew,
        contactsTotal,
        contactsRead,
        contactsArchived,
        newsCount,
        newsPublished,
        projectsCount,
        projectsFeatured,
        careersCount: careersActive,
        careersTotal,
        partnersCount,
        clientsCount,
        teamCount,
        servicesPublished,
        servicesTotal,
        operationsPublished,
        operationsTotal,
        usersCount,
        rolesCount,
        contactsByMonth,
        newsByMonth,
        lastLogins,
        recentActivity,
      });
    } catch (e) {
      next(e);
    }
  }
);

type CrudOpts = {
  sort?: Record<string, 1 | -1>;
  prepareCreate?: (body: Record<string, unknown>) => Record<string, unknown>;
};

function mountCrud(
  router: Router,
  path: string,
  perm: string,
  model: Model<any>,
  opts: CrudOpts = {}
) {
  const sort = opts.sort ?? { updatedAt: -1 };

  router.get(`/${path}`, authRequired, requirePermission(`${perm}.read`), async (_req, res, next) => {
    try {
      res.json(await model.find().sort(sort));
    } catch (e) {
      next(e);
    }
  });

  router.get(`/${path}/:id`, authRequired, requirePermission(`${perm}.read`), async (req, res, next) => {
    try {
      const doc = await model.findById(req.params.id);
      if (!doc) {
        res.status(404).json({ error: "Non trouvé" });
        return;
      }
      res.json(doc);
    } catch (e) {
      next(e);
    }
  });

  router.post(`/${path}`, authRequired, requirePermission(`${perm}.write`), async (req, res, next) => {
    try {
      let body: Record<string, unknown> = { ...req.body };
      if (opts.prepareCreate) body = opts.prepareCreate(body);
      const doc = await model.create(body);
      res.status(201).json(doc);
    } catch (e) {
      next(e);
    }
  });

  router.patch(`/${path}/:id`, authRequired, requirePermission(`${perm}.write`), async (req, res, next) => {
    try {
      const doc = await model.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });
      if (!doc) {
        res.status(404).json({ error: "Non trouvé" });
        return;
      }
      res.json(doc);
    } catch (e) {
      next(e);
    }
  });

  router.delete(`/${path}/:id`, authRequired, requirePermission(`${perm}.write`), async (req, res, next) => {
    try {
      const doc = await model.findByIdAndDelete(req.params.id);
      if (!doc) {
        res.status(404).json({ error: "Non trouvé" });
        return;
      }
      res.status(204).send();
    } catch (e) {
      next(e);
    }
  });
}

function slugFromTitle(body: Record<string, unknown>): Record<string, unknown> {
  const b = { ...body };
  if (b.title && !b.slug) b.slug = slugify(String(b.title));
  return b;
}

/** Actualités : slug URL-safe, date de publication si manquante, cohérent avec GET /api/news (published). */
function prepareNews(body: Record<string, unknown>): Record<string, unknown> {
  const b = slugFromTitle(body);
  if (b.slug != null && String(b.slug).trim() !== "") {
    b.slug = slugify(String(b.slug));
  }
  const pub = b.published !== false;
  b.published = pub;
  if (pub && (b.publishedAt == null || b.publishedAt === "")) {
    b.publishedAt = new Date().toISOString();
  }
  return b;
}

mountCrud(adminRouter, "activity-operations", "activity_operations", ActivityOperation, {
  sort: { order: 1, createdAt: -1 },
  prepareCreate: slugFromTitle,
});
mountCrud(adminRouter, "activity-services", "activity_services", ActivityService, {
  sort: { order: 1, createdAt: -1 },
});
mountCrud(adminRouter, "careers", "career", Career);
mountCrud(adminRouter, "clients", "clients", Client, { sort: { order: 1 } });
mountCrud(adminRouter, "infrastructures", "infrastructure", Infrastructure, { sort: { order: 1 } });
mountCrud(adminRouter, "partners", "partners", Partner, { sort: { order: 1 } });
mountCrud(adminRouter, "team", "team", Team, { sort: { order: 1, createdAt: -1 } });
mountCrud(adminRouter, "projects", "projects", Project, { prepareCreate: slugFromTitle });
mountCrud(adminRouter, "news", "news", News, { prepareCreate: prepareNews });

const ABOUT_KEY = "about";
const ABOUT_BLOCK_FIELDS: Record<string, string[]> = {
  hero: ["kicker", "title", "intro"],
  presentation: ["cardTitle", "cardText", "cardCheck"],
  missionServices: ["missionH2", "missionP1", "missionP2", "servicesH2"],
  strengths: ["strengthsTitle", "standardsBadge", "strengths"],
  servicesCards: ["services"],
  teamPublic: ["expertsH2", "expertsBadge", "teamEmptyText", "teamFallbackTitle", "teamFallbackDescription"],
  experience: ["experienceKicker", "experienceYears", "experienceText"],
  asideContact: ["asideMissionH3", "asideMissionText", "contactCta"],
};

function normalizeAboutValue(raw: unknown): Record<string, unknown> {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  return { ...(raw as Record<string, unknown>) };
}

adminRouter.get("/about", authRequired, requirePermission("configuration.read"), async (_req, res, next) => {
  try {
    const row = await Configuration.findOne({ key: ABOUT_KEY }).lean();
    res.json(normalizeAboutValue(row?.value));
  } catch (e) {
    next(e);
  }
});

adminRouter.put("/about", authRequired, requirePermission("configuration.write"), async (req, res, next) => {
  try {
    const incoming = normalizeAboutValue(req.body?.value);
    const doc = await Configuration.findOneAndUpdate(
      { key: ABOUT_KEY },
      { key: ABOUT_KEY, value: incoming },
      { new: true, upsert: true, runValidators: true }
    ).lean();
    res.json(normalizeAboutValue(doc?.value));
  } catch (e) {
    next(e);
  }
});

adminRouter.patch("/about/:block", authRequired, requirePermission("configuration.write"), async (req, res, next) => {
  try {
    const block = String(req.params.block ?? "");
    const allowedFields = ABOUT_BLOCK_FIELDS[block];
    if (!allowedFields) {
      res.status(400).json({ error: "Bloc About invalide" });
      return;
    }
    const incoming = normalizeAboutValue(req.body?.value);
    const filtered = Object.fromEntries(Object.entries(incoming).filter(([k]) => allowedFields.includes(k)));
    const existing = await Configuration.findOne({ key: ABOUT_KEY }).lean();
    const current = normalizeAboutValue(existing?.value);
    const nextValue = { ...current, ...filtered };
    const doc = await Configuration.findOneAndUpdate(
      { key: ABOUT_KEY },
      { key: ABOUT_KEY, value: nextValue },
      { new: true, upsert: true, runValidators: true }
    ).lean();
    res.json(normalizeAboutValue(doc?.value));
  } catch (e) {
    next(e);
  }
});

adminRouter.get("/contacts", authRequired, requirePermission("contact.read"), async (_req, res, next) => {
  try {
    res.json(await Contact.find().sort({ createdAt: -1 }));
  } catch (e) {
    next(e);
  }
});

adminRouter.get("/contacts/:id", authRequired, requirePermission("contact.read"), async (req, res, next) => {
  try {
    const doc = await Contact.findById(req.params.id);
    if (!doc) {
      res.status(404).json({ error: "Non trouvé" });
      return;
    }
    res.json(doc);
  } catch (e) {
    next(e);
  }
});

adminRouter.patch(
  "/contacts/:id",
  authRequired,
  requirePermission("contact.write"),
  async (req, res, next) => {
    try {
      const doc = await Contact.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
      if (!doc) {
        res.status(404).json({ error: "Non trouvé" });
        return;
      }
      res.json(doc);
    } catch (e) {
      next(e);
    }
  }
);

adminRouter.delete(
  "/contacts/:id",
  authRequired,
  requirePermission("contact.write"),
  async (req, res, next) => {
    try {
      const doc = await Contact.findByIdAndDelete(req.params.id);
      if (!doc) {
        res.status(404).json({ error: "Non trouvé" });
        return;
      }
      res.status(204).send();
    } catch (e) {
      next(e);
    }
  }
);

adminRouter.get(
  "/configurations",
  authRequired,
  requirePermission("configuration.read"),
  async (_req, res, next) => {
    try {
      res.json(await Configuration.find().sort({ key: 1 }));
    } catch (e) {
      next(e);
    }
  }
);

adminRouter.get(
  "/configurations/:key",
  authRequired,
  requirePermission("configuration.read"),
  async (req, res, next) => {
    try {
      const doc = await Configuration.findOne({ key: req.params.key });
      if (!doc) {
        res.status(404).json({ error: "Non trouvé" });
        return;
      }
      res.json(doc);
    } catch (e) {
      next(e);
    }
  }
);

adminRouter.put(
  "/configurations/:key",
  authRequired,
  requirePermission("configuration.write"),
  async (req, res, next) => {
    try {
      const doc = await Configuration.findOneAndUpdate(
        { key: req.params.key },
        { key: req.params.key, value: req.body?.value },
        { new: true, upsert: true, runValidators: true }
      );
      res.json(doc);
    } catch (e) {
      next(e);
    }
  }
);

adminRouter.delete(
  "/configurations/:key",
  authRequired,
  requirePermission("configuration.write"),
  async (req, res, next) => {
    try {
      await Configuration.deleteOne({ key: req.params.key });
      res.status(204).send();
    } catch (e) {
      next(e);
    }
  }
);

adminRouter.get("/users", authRequired, requirePermission("users.read"), async (_req, res, next) => {
  try {
    const users = await User.find().populate("roleId").sort({ createdAt: -1 });
    res.json(users.map((u) => u.toJSON()));
  } catch (e) {
    next(e);
  }
});

adminRouter.get("/users/:id", authRequired, requirePermission("users.read"), async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).populate("roleId");
    if (!user) {
      res.status(404).json({ error: "Non trouvé" });
      return;
    }
    res.json(user.toJSON());
  } catch (e) {
    next(e);
  }
});

adminRouter.post("/users", authRequired, requirePermission("users.write"), async (req, res, next) => {
  try {
    const email = String(req.body?.email ?? "")
      .toLowerCase()
      .trim();
    const password = String(req.body?.password ?? "");
    const roleId = req.body?.roleId;
    if (!email || !password || !roleId) {
      res.status(400).json({ error: "email, password et roleId requis" });
      return;
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      email,
      passwordHash,
      roleId,
      active: req.body?.active !== false,
    });
    const out = await User.findById(user._id).populate("roleId");
    res.status(201).json(out!.toJSON());
  } catch (e) {
    next(e);
  }
});

adminRouter.patch("/users/:id", authRequired, requirePermission("users.write"), async (req, res, next) => {
  try {
    const raw = req.body as Record<string, unknown>;
    const { password, ...rest } = raw;
    const body: Record<string, unknown> = { ...rest };
    if (password) {
      body.passwordHash = await bcrypt.hash(String(password), 10);
    }
    const user = await User.findByIdAndUpdate(req.params.id, body, { new: true, runValidators: true }).populate(
      "roleId"
    );
    if (!user) {
      res.status(404).json({ error: "Non trouvé" });
      return;
    }
    res.json(user.toJSON());
  } catch (e) {
    next(e);
  }
});

adminRouter.delete(
  "/users/:id",
  authRequired,
  requirePermission("users.write"),
  async (req: AuthedRequest, res, next) => {
    try {
      if (req.params.id === req.user?.id) {
        res.status(400).json({ error: "Impossible de supprimer votre propre compte" });
        return;
      }
      const doc = await User.findByIdAndDelete(req.params.id);
      if (!doc) {
        res.status(404).json({ error: "Non trouvé" });
        return;
      }
      res.status(204).send();
    } catch (e) {
      next(e);
    }
  }
);

mountCrud(adminRouter, "roles", "role", Role);

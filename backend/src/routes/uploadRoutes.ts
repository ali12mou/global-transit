import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Router } from "express";
import multer from "multer";
import { authRequired } from "../middleware/auth.js";
import { requirePermission } from "../middleware/requirePermission.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, "..", "..");
const uploadsRoot = path.join(projectRoot, "uploads");

/** Catégories d’upload : sous-dossier + permission d’écriture admin */
const UPLOAD_CONFIG = {
  services: { subdir: "services", permission: "activity_services.write" as const },
  operations: { subdir: "operations", permission: "activity_operations.write" as const },
  partners: { subdir: "partners", permission: "partners.write" as const },
  clients: { subdir: "clients", permission: "clients.write" as const },
  infrastructure: { subdir: "infrastructure", permission: "infrastructure.write" as const },
  projects: { subdir: "projects", permission: "projects.write" as const },
  news: { subdir: "news", permission: "news.write" as const },
  team: { subdir: "team", permission: "team.write" as const },
} as const;

export type UploadCategory = keyof typeof UPLOAD_CONFIG;

function ensureDir(dir: string) {
  fs.mkdirSync(dir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, _file, cb) => {
    const raw = String(req.query.category ?? "");
    if (!(raw in UPLOAD_CONFIG)) {
      cb(new Error("Catégorie d’upload invalide"), "");
      return;
    }
    const subdir = UPLOAD_CONFIG[raw as UploadCategory].subdir;
    const dest = path.join(uploadsRoot, subdir);
    ensureDir(dest);
    cb(null, dest);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || ".png";
    const safe = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}${ext}`;
    cb(null, safe);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed =
      /^image\/(jpeg|png|gif|webp)$/.test(file.mimetype) || file.mimetype === "image/svg+xml";
    if (allowed) cb(null, true);
    else cb(new Error("Format accepté : JPEG, PNG, GIF, WebP, SVG"));
  },
});

export const uploadRoutes = Router();

uploadRoutes.post(
  "/upload/image",
  authRequired,
  (req, res, next) => {
    const raw = String(req.query.category ?? "");
    if (!(raw in UPLOAD_CONFIG)) {
      res.status(400).json({
        error: `Paramètre ?category= requis : ${Object.keys(UPLOAD_CONFIG).join(", ")}`,
      });
      return;
    }
    const { permission } = UPLOAD_CONFIG[raw as UploadCategory];
    requirePermission(permission)(req, res, next);
  },
  (req, res, next) => {
    upload.single("file")(req, res, (err) => {
      if (err) {
        res.status(400).json({ error: err instanceof Error ? err.message : String(err) });
        return;
      }
      next();
    });
  },
  (req, res) => {
    const raw = String(req.query.category ?? "") as UploadCategory;
    const file = req.file;
    if (!file) {
      res.status(400).json({ error: "Aucun fichier reçu (champ attendu : file)" });
      return;
    }
    const { subdir } = UPLOAD_CONFIG[raw];
    const url = `/uploads/${subdir}/${file.filename}`;
    res.status(201).json({ url, imageUrl: url, logoUrl: url, photoUrl: url });
  }
);

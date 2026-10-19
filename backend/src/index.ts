import "dotenv/config";
import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import cors from "cors";
import { connectDbWithRetry, isDbConnected } from "./config/db.js";
import { authRouter } from "./routes/auth.js";
import { publicRouter } from "./routes/public.js";
import { contactPublicRouter } from "./routes/contactPublic.js";
import { trackPublicRouter } from "./routes/trackPublic.js";
import { uploadRoutes } from "./routes/uploadRoutes.js";
import { adminRouter } from "./routes/admin.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsRoot = path.join(__dirname, "..", "uploads");

const PORT = Number(process.env.PORT) || 5006;
const MONGODB_URI = process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017/globaltransit";
const CORS_ORIGIN = process.env.CORS_ORIGIN ?? "http://localhost:5173";

const app = express();
app.use(
  cors({
    origin: CORS_ORIGIN,
    credentials: true,
  })
);
app.use(express.json({ limit: "2mb" }));
app.use("/uploads", express.static(uploadsRoot));

app.get("/api/health", (_req, res) => {
  const db = isDbConnected();
  res.status(db ? 200 : 503).json({ ok: db, db: db ? "connected" : "disconnected" });
});

// Tant que MongoDB n'est pas joignable, réponse 503 explicite plutôt qu'une requête bloquée.
app.use("/api", (_req, res, next) => {
  if (isDbConnected()) {
    next();
    return;
  }
  res.status(503).json({ error: "Base de données indisponible, réessayez dans quelques instants" });
});

app.use("/api/auth", authRouter);
app.use("/api", publicRouter);
app.use("/api/contact", contactPublicRouter);
app.use("/api/track", trackPublicRouter);
app.use("/api/admin", uploadRoutes);
app.use("/api/admin", adminRouter);

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  const message = err instanceof Error ? err.message : String(err);
  const dev = process.env.NODE_ENV !== "production";
  res.status(500).json({
    error: "Erreur serveur",
    ...(dev && { details: message }),
  });
});

app.listen(PORT, () => {
  console.log(`API écoute sur http://localhost:${PORT}`);
});
connectDbWithRetry(MONGODB_URI);

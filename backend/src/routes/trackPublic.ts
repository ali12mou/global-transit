import { Router } from "express";
import { Visit } from "../models/Visit.js";

export const trackPublicRouter = Router();

const BOT_UA = /bot|crawl|spider|slurp|preview|headless|lighthouse|pingdom|monitor|curl|wget|python|axios/i;
const ID_RE = /^[a-zA-Z0-9-]{8,64}$/;

function deviceFromUa(ua: string): "desktop" | "mobile" | "tablet" {
  if (/ipad|tablet|playbook|silk|(android(?!.*mobile))/i.test(ua)) return "tablet";
  if (/mobi|iphone|ipod|android|blackberry|opera mini|iemobile/i.test(ua)) return "mobile";
  return "desktop";
}

function referrerHost(raw: unknown): string {
  const s = String(raw ?? "").trim();
  if (!s) return "";
  try {
    return new URL(s).hostname.replace(/^www\./, "").slice(0, 200);
  } catch {
    return "";
  }
}

/** Enregistre une page vue du site public (appelé par le frontend à chaque changement de page). */
trackPublicRouter.post("/", async (req, res, next) => {
  try {
    const ua = String(req.headers["user-agent"] ?? "");
    const path = String(req.body?.path ?? "").trim();
    const visitorId = String(req.body?.visitorId ?? "").trim();
    const sessionId = String(req.body?.sessionId ?? "").trim();

    if (!ua || BOT_UA.test(ua) || !path.startsWith("/") || path.startsWith("/admin")) {
      res.status(204).send();
      return;
    }
    if (!ID_RE.test(visitorId) || !ID_RE.test(sessionId)) {
      res.status(400).json({ error: "Identifiants invalides" });
      return;
    }

    await Visit.create({
      path: path.split(/[?#]/)[0]!.slice(0, 300),
      visitorId,
      sessionId,
      referrer: referrerHost(req.body?.referrer),
      device: deviceFromUa(ua),
      lang: String(req.body?.lang ?? "").slice(0, 12),
    });
    res.status(204).send();
  } catch (e) {
    next(e);
  }
});

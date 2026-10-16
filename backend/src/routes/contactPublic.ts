import { Router } from "express";
import { Contact } from "../models/Contact.js";

export const contactPublicRouter = Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function field(body: unknown, key: string, max = 200): string {
  const v = (body as Record<string, unknown> | undefined)?.[key];
  return String(v ?? "").trim().slice(0, max);
}

/** Formulaire de contact du site (accueil et page Contact). */
contactPublicRouter.post("/", async (req, res, next) => {
  try {
    const firstName = field(req.body, "firstName", 80);
    const lastName = field(req.body, "lastName", 80);
    const fullName = field(req.body, "fullName", 160) || [firstName, lastName].filter(Boolean).join(" ");
    const email = field(req.body, "email", 160);
    if (!fullName || !email) {
      res.status(400).json({ error: "Nom et email requis" });
      return;
    }
    if (!EMAIL_RE.test(email)) {
      res.status(400).json({ error: "Adresse email invalide" });
      return;
    }
    const doc = await Contact.create({
      fullName,
      firstName,
      lastName,
      email,
      company: field(req.body, "company", 160),
      jobTitle: field(req.body, "jobTitle", 120),
      phone: field(req.body, "phone", 40),
      country: field(req.body, "country", 80),
      subject: field(req.body, "subject", 120),
      route: field(req.body, "route", 200),
      preferredContact: field(req.body, "preferredContact", 20),
      service: field(req.body, "service", 120),
      message: field(req.body, "message", 5000),
      status: "new",
    });
    res.status(201).json({ id: doc._id, ok: true });
  } catch (e) {
    next(e);
  }
});

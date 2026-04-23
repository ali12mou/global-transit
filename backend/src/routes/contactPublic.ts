import { Router } from "express";
import { Contact } from "../models/Contact.js";

export const contactPublicRouter = Router();

contactPublicRouter.post("/", async (req, res, next) => {
  try {
    const fullName = String(req.body?.fullName ?? "").trim();
    const email = String(req.body?.email ?? "").trim();
    const service = String(req.body?.service ?? "").trim();
    const message = String(req.body?.message ?? "").trim();
    if (!fullName || !email) {
      res.status(400).json({ error: "Nom et email requis" });
      return;
    }
    const doc = await Contact.create({ fullName, email, service, message, status: "new" });
    res.status(201).json({ id: doc._id, ok: true });
  } catch (e) {
    next(e);
  }
});

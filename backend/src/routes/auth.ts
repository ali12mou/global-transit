import { Router } from "express";
import bcrypt from "bcryptjs";
import { User } from "../models/User.js";
import { signToken } from "../lib/jwt.js";
import { authRequired, type AuthedRequest } from "../middleware/auth.js";

export const authRouter = Router();

authRouter.post("/login", async (req, res, next) => {
  try {
    const email = String(req.body?.email ?? "").toLowerCase().trim();
    const password = String(req.body?.password ?? "");
    if (!email || !password) {
      res.status(400).json({ error: "Email et mot de passe requis" });
      return;
    }
    const user = await User.findOne({ email }).select("+passwordHash");
    if (!user || !user.active) {
      res.status(401).json({ error: "Identifiants invalides" });
      return;
    }
    let ok = false;
    try {
      ok = await bcrypt.compare(password, user.passwordHash);
    } catch {
      res.status(401).json({ error: "Identifiants invalides" });
      return;
    }
    if (!ok) {
      res.status(401).json({ error: "Identifiants invalides" });
      return;
    }
    user.lastLogin = new Date();
    await user.save();

    const roleIdStr = String(user.roleId);

    const token = signToken({
      sub: String(user._id),
      email: user.email,
      roleId: roleIdStr,
    });

    const userOut = user.toJSON();
    res.json({
      token,
      user: userOut,
    });
  } catch (e) {
    next(e);
  }
});

authRouter.get("/me", authRequired, async (req: AuthedRequest, res, next) => {
  try {
    const user = await User.findById(req.user!.id).populate("roleId");
    if (!user) {
      res.status(404).json({ error: "Utilisateur introuvable" });
      return;
    }
    res.json(user.toJSON());
  } catch (e) {
    next(e);
  }
});

import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "../lib/jwt.js";
import { User } from "../models/User.js";
import { Role } from "../models/Role.js";

export type AuthedRequest = Request & {
  user?: {
    id: string;
    email: string;
    roleId: string;
    permissions: string[];
    active: boolean;
  };
};

export async function authRequired(req: AuthedRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Token manquant" });
    return;
  }
  const token = header.slice(7);
  try {
    const payload = verifyToken(token);
    const user = await User.findById(payload.sub);
    if (!user || !user.active) {
      res.status(401).json({ error: "Utilisateur invalide" });
      return;
    }
    const role = await Role.findById(user.roleId);
    const permissions = role?.permissions ?? [];
    req.user = {
      id: String(user._id),
      email: user.email,
      roleId: String(user.roleId),
      permissions,
      active: user.active,
    };
    next();
  } catch {
    res.status(401).json({ error: "Token invalide" });
  }
}

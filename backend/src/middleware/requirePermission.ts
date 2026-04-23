import type { Response, NextFunction } from "express";
import type { AuthedRequest } from "./auth.js";

export function requirePermission(required: string) {
  return (req: AuthedRequest, res: Response, next: NextFunction) => {
    const perms = req.user?.permissions ?? [];
    if (perms.includes("*")) {
      next();
      return;
    }
    if (perms.includes(required)) {
      next();
      return;
    }
    const prefix = required.split(".")[0];
    if (prefix && perms.includes(`${prefix}.*`)) {
      next();
      return;
    }
    res.status(403).json({ error: "Permission refusée" });
  };
}

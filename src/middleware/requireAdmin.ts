import type { NextFunction, Request, Response } from "express";

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const s = req.session as { userId?: number; role?: string };

  if (!s.userId || s.role !== "ADMIN") {
    res.status(401).json({ error: "Require Admin Access" });
    return;
  }

  next();
}


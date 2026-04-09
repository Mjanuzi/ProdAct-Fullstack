import bcrypt from "bcrypt";
import { Router } from "express";
import { prisma } from "../lib/prisma";

export const authRouter = Router();

authRouter.get("/api/auth/me", async (req, res) => {
  try {
    const s = req.session as { userId?: number; role?: string };
    if (!s.userId) {
      res.status(401).json({ error: "Not logged in" });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: s.userId },
      select: { id: true, email: true, role: true },
    });
    if (!user) {
      res.status(401).json({ error: "Not logged in" });
      return;
    }

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

authRouter.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body as {
      email?: string;
      password?: string;
    };

    if (
      !email ||
      !password ||
      typeof email !== "string" ||
      typeof password !== "string"
    ) {
      res.status(400).json({ error: "Email och lösenord krävs" });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { email: email.trim() },
    });

    if (!user) {
      res.status(401).json({ error: "Fel email eller lösenord" });
      return;
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      res.status(401).json({ error: "Fel email eller lösenord" });
      return;
    }

    const s = req.session as { userId?: number; role?: string };
    s.userId = user.id;
    s.role = user.role;

    res.json({
      id: user.id,
      email: user.email,
      role: user.role,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

authRouter.post("/api/auth/logout", (req, res) => {
  req.session.destroy((err: unknown) => {
    if (err) {
      res.status(500).json({ error: "Internal server error" });
      return;
    }
    res.status(204).end();
  });
});


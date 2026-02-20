import express from "express";
import { prisma } from "./lib/prisma";

const app = express();
const port = process.env.PORT ?? 3001;

//Healthcheck
app.get("/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false });
  }
});

app.listen(port, () => {
  console.log(`Backend listening on http://localhost:${port}`);
});

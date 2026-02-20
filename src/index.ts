import express from "express";
import cors from "cors";
import { prisma } from "./lib/prisma";

const app = express();
const port = process.env.PORT ?? 3001;

app.use(cors());
app.use(express.json());

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

//Products for everyone to see
app.get("/api/products", async (req, res) => {
  try {
    const searchQuery = req.query.q as string | undefined;

    //if no input return an empty list or error message
    if (!searchQuery || searchQuery.trim() === "") {
      res.json({
        products: [],
        message: "Insert a serach word",
      });
      return;
    }
    //serach name or brand, case insensitive, partial match
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        OR: [
          {
            name: {
              contains: searchQuery.trim(),
              mode: "insensitive",
            },
          },
          {
            brand: {
              contains: searchQuery.trim(),
              mode: "insensitive",
            },
          },
        ],
      },
      include: {
        category: true,
      },
      orderBy: {
        name: "asc",
      },
      take: 20, //max 20 results
    });

    //if no result error message
    if (products.length === 0) {
      res.json({
        products: [],
        message: `Could not find "${searchQuery}". Please check spelling or try another word.`,
      });
      return;
    }
    res.json({ products });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Intern server error" });
  }
});

//

app.listen(port, () => {
  console.log(`Backend listening on http://localhost:${port}`);
});

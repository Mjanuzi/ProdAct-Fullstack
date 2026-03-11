import express from "express";
import cors from "cors";
import { prisma } from "./lib/prisma";
import { fetchProductByEan } from "./services/OpenFoodFacts";
import session from "express-session";
import bcrypt from "bcrypt";
import type { Prisma } from "@prisma/client";

const app = express();
const port = process.env.PORT ?? 3001;

app.use(
  session({
    secret: process.env.SESSION_SECRET ?? "dev-secret-change-in-production",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, //24h
    },
  }),
);

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());

function requireAdmin(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) {
  const s = req.session as { userId?: number; role?: string };

  if (!s.userId || s.role !== "ADMIN") {
    res.status(401).json({ error: "Require Admin Access" });
    return;
  }
  next();
}

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

//Admin login
app.post("/api/auth/login", async (req, res) => {
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

//Admin logout
app.post("/api/auth/logout", (req, res) => {
  req.session.destroy((err: unknown) => {
    if (err) {
      res.status(500).json({ error: "Internal server error" });
      return;
    }
    res.status(204).end();
  });
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

//Get ONE product with placement open for everyone
app.get("/api/products/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      res.status(400).json({ error: "Invalid id" });
    }

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        locations: {
          include: {
            shelf: {
              include: {
                section: {
                  include: {
                    aisle: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!product) {
      res.status(404).json({ error: "Did not find product" });
      return;
    }

    //Formation on placement as (Mejeri -> Gång 5 -> Hylla 3)
    const formattedLocations = product.locations.map((location) => {
      const aisle = location.shelf.section.aisle.name;
      const section = location.shelf.section.name;
      const shelfLevel = location.shelf.level;
      const position = location.position != null ? `Position ${location.position}` : "";

      return {
        id: location.id,
        //Here is the format
        display: `${section} -> ${aisle} -> Hylla ${shelfLevel}${position}`,
        aisle: aisle,
        section: section,
        shelfLevel: shelfLevel,
        position: position,
      };
    });

    res.json({
      id: product.id,
      ean: product.ean,
      name: product.name,
      brand: product.brand,
      description: product.description,
      category: product.category?.name || null,
      openFoodFactsId: product.openFoodFactsId,
      locations: formattedLocations,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

//Add new product for admin user and route, Get product from Open Food Facts API
app.post("/api/admin/products", requireAdmin, async (req, res) => {
  try {
    const { ean, shelfId } = req.body as { ean?: string; shelfId?: number };

    if (!ean || typeof ean !== "string" || !ean.trim()) {
      res.status(400).json({ error: "EAN is required" });
      return;
    }

    const normalizedEan = ean.trim().replace(/\s/g, "");
    if (normalizedEan.length < 8) {
      res.status(400).json({ error: "Invalid EAN" });
      return;
    }

    //if it already exist in out database
    const existing = await prisma.product.findUnique({
      where: { ean: normalizedEan },
    });
    if (existing) {
      res.status(409).json({
        error: "Product already exists",
        productId: existing.id,
      });
      return;
    }

    const offProduct = await fetchProductByEan(normalizedEan);

    if (!offProduct) {
      res.status(404).json({
        error:
          "Could not find product in Open Food Facts, please check the EAN",
      });
      return;
    }

    const name = offProduct.name;
    const brand = offProduct.brand;
    const description = offProduct.description;
    const categoryName = offProduct.categoryName;

    //Create or find a catagory
    let category = await prisma.category.findFirst({
      where: { name: categoryName },
    });
    if (!category) {
      category = await prisma.category.create({
        data: { name: categoryName },
      });
    }

    //Create product
    const product = await prisma.product.create({
      data: {
        ean: normalizedEan,
        openFoodFactsId: offProduct.openFoodFactsId,
        name,
        brand,
        description,
        categoryId: category.id,
      },
    });

    //Placement if shelfsId is provided
    if (shelfId != null && Number.isInteger(shelfId)) {
      await prisma.productLocation.create({
        data: {
          productId: product.id,
          shelfId,
          position: null,
        },
      });
    }

    const productWithLocation = await prisma.product.findUnique({
      where: { id: product.id },
      include: {
        category: true,
        locations: {
          include: {
            shelf: {
              include: {
                section: { include: { aisle: true } },
              },
            },
          },
        },
      },
    });

    res.status(201).json(productWithLocation);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

//Admin route - Update a product
app.put("/api/admin/products/:id", requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }

    const { name, brand, description, categoryId } = req.body as {
      name?: string;
      brand?: string;
      description?: string;
      categoryId?: number;
    };

    // Bygg upp vilka fält som faktiskt ska uppdateras
    const data: Prisma.ProductUpdateInput = {};

    if (typeof name === "string" && name.trim()) {
      data.name = name.trim();
    }
    if (typeof brand === "string") {
      data.brand = brand.trim();
    }
    if (typeof description === "string") {
      data.description = description.trim();
    }

    // Om categoryId skickas: verifiera att kategorin finns
    if (categoryId != null) {
      const catId = Number(categoryId);
      if (Number.isNaN(catId)) {
        res.status(400).json({ error: "Invalid categoryId" });
        return;
      }
      const category = await prisma.category.findUnique({
        where: { id: catId },
      });
      if (!category) {
        res.status(400).json({ error: "Category not found" });
        return;
      }
      data.category = { connect: { id: category.id } };
    }

    if (Object.keys(data).length === 0) {
      res.status(400).json({ error: "No fields to update" });
      return;
    }

    const updated = await prisma.product.update({
      where: { id },
      data,
      include: {
        category: true,
        locations: {
          include: {
            shelf: {
              include: {
                section: { include: { aisle: true } },
              },
            },
          },
        },
      },
    });

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.delete("/api/admin/products/:id", requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }

    //Existing product?
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    //Delete placement in store first
    await prisma.productLocation.deleteMany({
      where: { productId: id },
    });

    //Delete the product
    await prisma.product.delete({
      where: { id },
    });

    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.put("/api/admin/products/:id/locations", requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }
    const { locations } = req.body as {
      locations?: { shelfId: number; position?: number }[];
    };
    if (!Array.isArray(locations) || locations.length === 0) {
      res
        .status(400)
        .json({ error: "locations needs to be a non empty array" });
      return;
    }
    // Finns produkten?
    const product = await prisma.product.findUnique({
      where: { id },
    });
    if (!product) {
      res.status(404).json({ error: "Product not found" });
      return;
    }
    // Validera alla shelfId
    const shelfIds = locations.map((loc) => Number(loc.shelfId));
    if (shelfIds.some((sid) => Number.isNaN(sid))) {
      res.status(400).json({ error: "Invalid shelfId in locations" });
      return;
    }
    const distinctShelfIds = Array.from(new Set(shelfIds));
    const shelves = await prisma.shelf.findMany({
      where: { id: { in: distinctShelfIds } },
      select: { id: true },
    });
    const existingShelfIds = new Set(shelves.map((s) => s.id));
    const missing = distinctShelfIds.filter(
      (sid) => !existingShelfIds.has(sid),
    );
    if (missing.length > 0) {
      res.status(400).json({
        error: "Following shelfId does not exist",
        missingShelfIds: missing,
      });
      return;
    }
    // Ersätt alla gamla placeringar med nya
    await prisma.$transaction([
      prisma.productLocation.deleteMany({
        where: { productId: id },
      }),
      prisma.productLocation.createMany({
        data: locations.map((loc) => ({
          productId: id,
          shelfId: Number(loc.shelfId),
          position: typeof loc.position === "number" ? loc.position : null,
        })),
      }),
    ]);
    // Hämta produkten med uppdaterade placeringar
    const updated = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        locations: {
          include: {
            shelf: {
              include: {
                section: { include: { aisle: true } },
              },
            },
          },
        },
      },
    });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(port, () => {
  console.log(`Backend listening on http://localhost:${port}`);
});

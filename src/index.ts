import express from "express";
import cors from "cors";
import { prisma } from "./lib/prisma";
import { fetchProductByEan } from "./services/OpenFoodFacts";

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
      const position = location.position ? `Position ${location.position}` : "";

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
app.post("/api/products", async (req, res) => {
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

app.listen(port, () => {
  console.log(`Backend listening on http://localhost:${port}`);
});

import { Router } from "express";
import { prisma } from "../lib/prisma";
import { fetchProductByEan } from "../services/OpenFoodFacts";

export const productsRouter = Router();

productsRouter.get("/api/products", async (req, res) => {
  try {
    const searchQuery = req.query.q as string | undefined;

    if (!searchQuery || searchQuery.trim() === "") {
      res.json({
        products: [],
        message: "Insert a search word",
      });
      return;
    }

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
      take: 20,
    });

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
    res.status(500).json({ error: "Internal server error" });
  }
});

productsRouter.get("/api/products/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      res.status(400).json({ error: "Invalid id" });
      return;
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

    // Backfill image URL for older products that were created before image support.
    let imageUrl = product.imageUrl ?? null;
    if (!imageUrl) {
      const offProduct = await fetchProductByEan(product.ean);
      if (offProduct?.imageUrl) {
        imageUrl = offProduct.imageUrl;
        await prisma.product.update({
          where: { id: product.id },
          data: { imageUrl },
        });
      }
    }

    const formattedLocations = product.locations.map((location) => {
      const aisle = location.shelf.section.aisle.name;
      const section = location.shelf.section.name;
      const shelfLevel = location.shelf.level;
      const position =
        location.position != null ? `Position ${location.position}` : "";
      const positionDisplaySuffix = position ? ` ${position}` : "";

      return {
        id: location.id,
        display: `${section} -> ${aisle} -> Hylla ${shelfLevel}${positionDisplaySuffix}`,
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
      imageUrl,
      locations: formattedLocations,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});


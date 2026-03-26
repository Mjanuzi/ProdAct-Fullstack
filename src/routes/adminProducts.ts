import type { Prisma } from "@prisma/client";
import { Router } from "express";
import { prisma } from "../lib/prisma";
import { requireAdmin } from "../middleware/requireAdmin";
import { fetchProductByEan } from "../services/OpenFoodFacts";

export const adminProductsRouter = Router();

adminProductsRouter.post("/api/admin/products", requireAdmin, async (req, res) => {
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

    let category = await prisma.category.findFirst({
      where: { name: categoryName },
    });
    if (!category) {
      category = await prisma.category.create({
        data: { name: categoryName },
      });
    }

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
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

adminProductsRouter.put("/api/admin/products/:id", requireAdmin, async (req, res) => {
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

adminProductsRouter.delete("/api/admin/products/:id", requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }

    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    await prisma.productLocation.deleteMany({
      where: { productId: id },
    });

    await prisma.product.delete({
      where: { id },
    });

    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

adminProductsRouter.put(
  "/api/admin/products/:id/locations",
  requireAdmin,
  async (req, res) => {
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

      const product = await prisma.product.findUnique({
        where: { id },
      });
      if (!product) {
        res.status(404).json({ error: "Product not found" });
        return;
      }

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
  },
);


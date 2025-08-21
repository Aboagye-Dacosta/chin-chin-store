import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getProducts = query({
  args: {
    storeId: v.optional(v.id("stores")),
  },

  handler: async (ctx, args) => {
    if (!args.storeId) return [];
    const products = await ctx.db
      .query("productsByStore")
      .withIndex("byStore", (q) => q.eq("storeId", args.storeId!))
      .collect();

    const enrichedStoreProducts = await Promise.all(
      products.map(async (storeProduct) => {
        const product = await ctx.db.get(storeProduct.productId);
        if (!product) return;
        const category = await ctx.db.get(product.categoryId);
        if (!category) return;
        return {
          ...product,
          stock: storeProduct.quantity,
          category,
        };
      })
    );

    return enrichedStoreProducts;
  },
});

export const getAllProducts = query({
  handler: async (ctx) => {
    const products = await ctx.db.query("products").collect();
    const enrichedProducts = await Promise.all(
      products.map(async (product) => {
        const category = await ctx.db.get(product.categoryId);
        if (!category) return null;
        return {
          ...product,
          category,
        };
      })
    );
    return enrichedProducts?.filter((product) => product !== null) ?? [];
  },
});

export const addProduct = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    price: v.float64(),
    image: v.optional(v.string()),
    model: v.optional(v.string()),
    status: v.union(v.literal("Active"), v.literal("Inactive")),
    packaging: v.union(v.literal("Bag"), v.literal("Can")),
    categoryId: v.id("categories"),
  },
  handler: async (ctx, args) => {
    try {
      await ctx.db.insert("products", {
        title: args.title,
        description: args.description,
        price: args.price,
        image: args.image,
        model: args.model,
        status: args.status,
        packaging: args.packaging,
        categoryId: args.categoryId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      return { success: true, message: "Product added successfully" };
    } catch {
      return { success: false, message: "Failed to add product" };
    }
  },
});

export const updateProduct = mutation({
  args: {
    productId: v.id("products"),
    title: v.string(),
    description: v.string(),
    price: v.float64(),
    image: v.optional(v.string()),
    model: v.optional(v.string()),
    status: v.union(v.literal("Active"), v.literal("Inactive")),
    packaging: v.union(v.literal("Bag"), v.literal("Can")),
    categoryId: v.id("categories"),
  },
  handler: async (ctx, args) => {
    try {
      await ctx.db.patch(args.productId, {
        title: args.title,
        description: args.description,
        price: args.price,
        image: args.image,
        model: args.model,
        status: args.status,
        packaging: args.packaging,
        categoryId: args.categoryId,
        updatedAt: new Date().toISOString(),
      });
      return { success: true, message: "Product added successfully" };
    } catch {
      return { success: false, message: "Failed to add product" };
    }
  },
});

export const deleteProduct = mutation({
  args: {
    productId: v.id("products"),
  },
  handler: async (ctx, args) => {
    try {
      await ctx.db.delete(args.productId);
      return { success: true, message: "Product deleted successfully" };
    } catch {
      return { success: false, message: "Failed to delete product" };
    }
  },
});

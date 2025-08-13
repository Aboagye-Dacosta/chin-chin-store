import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getProducts = query({
  args: {
    storeId: v.optional(v.id("stores")),
  },

  handler: async (ctx, args) => {
    if (!args.storeId) return [];
    const products = await ctx.db
      .query("products")
      .withIndex("byStore", (q) => q.eq("storeId", args.storeId!))
      .collect();
    return products;
  },
});

export const getAllProducts = query({
  handler: async (ctx) => {
    const products = await ctx.db.query("products").collect();
    return products;
  },
});

export const addProduct = mutation({
  args: {
    storeId: v.id("stores"),
    title: v.string(),
    description: v.string(),
    price: v.float64(),
    stock: v.number(),
    image: v.optional(v.string()),
    status: v.union(v.literal("Active"), v.literal("Inactive")),
    packaging: v.union(v.literal("Bag"), v.literal("Can")),
    categoryId: v.id("categories"),
  },
  handler: async (ctx, args) => {
    try {
      await ctx.db.insert("products", {
        storeId: args.storeId,
        title: args.title,
        description: args.description,
        price: args.price,
        stock: args.stock,
        image: args.image,
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

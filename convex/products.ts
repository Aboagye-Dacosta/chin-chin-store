/**
 * Functions for managing products.
 */
import { ConvexError, v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";

/**
 * Retrieves products for a specific store.
 *
 * @param {object} args - The arguments for the query.
 * @param {string} [args.storeId] - The ID of the store to retrieve products for.
 * @returns {Array<object>} An array of enriched product objects.
 */
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
        let model;
        if (product.model) {
          if (product.model) {
            const result = await ctx.db.get(product.model);
            if (result) {
              model = await ctx.storage.getUrl(result.storageId);
            }
          }
        }
        let image;
        if (product.image) {
          const result = await ctx.db.get(product.image);
          if (result) {
            image = await ctx.storage.getUrl(result.storageId);
          }
        }

        if (!category) return;
        return {
          ...product,
          stock: storeProduct.quantity,
          category,
          image,
          model,
        };
      })
    );

    return enrichedStoreProducts
      .filter((product) => product !== null)
      .filter((product) => product?.status === "Active");
  },
});

/**
 * Retrieves all products.
 *
 * @returns {Array<object>} An array of enriched product objects.
 */
export const getAllProducts = query({
  handler: async (ctx) => {
    const products = await ctx.db.query("products").collect();
    const enrichedProducts = await Promise.all(
      products.map(async (product) => {
        const category = await ctx.db.get(product.categoryId);
        if (!category) return null;
        let model;
        if (product.model) {
          if (product.model) {
            const result = await ctx.db.get(product.model);
            if (result) {
              model = await ctx.storage.getUrl(result.storageId);
            }
          }
        }
        let image;
        if (product.image) {
          const result = await ctx.db.get(product.image);
          if (result) {
            image = await ctx.storage.getUrl(result.storageId);
          }
        }
        return {
          ...product,
          category,
          image,
          model,
        };
      })
    );
    return enrichedProducts?.filter((product) => product !== null) ?? [];
  },
});

/**
 * Adds a new product.
 *
 * @param {object} args - The arguments for the mutation.
 * @param {string} args.title - The title of the product.
 * @param {string} args.description - The description of the product.
 * @param {number} args.price - The price of the product.
 * @param {string} [args.image] - The ID of the product image asset.
 * @param {string} [args.model] - The ID of the product model asset.
 * @param {string} args.status - The status of the product ("Active" or "Inactive").
 * @param {string} args.packaging - The packaging type of the product ("Bag" or "Can").
 * @param {string} args.categoryId - The ID of the product category.
 * @returns {string} The ID of the new product.
 */
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
    const now = new Date().toISOString();
    return await ctx.db.insert("products", {
      title: args.title,
      description: args.description,
      price: args.price,
      image: args?.image ? (args.image as Id<"assets">) : undefined,
      model: args?.model ? (args?.model as Id<"assets">) : undefined,
      status: args.status,
      packaging: args.packaging,
      categoryId: args.categoryId,
      createdAt: now,
      updatedAt: now,
    });
  },
});

/**
 * Updates an existing product.
 *
 * @param {object} args - The arguments for the mutation.
 * @param {string} args.productId - The ID of the product to update.
 * @param {string} args.title - The new title of the product.
 * @param {string} args.description - The new description of the product.
 * @param {number} args.price - The new price of the product.
 * @param {string} [args.image] - The new ID of the product image asset.
 * @param {string} [args.model] - The new ID of the product model asset.
 * @param {string} args.status - The new status of the product ("Active" or "Inactive").
 * @param {string} args.packaging - The new packaging type of the product ("Bag" or "Can").
 * @param {string} args.categoryId - The new ID of the product category.
 */
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
    const now = new Date().toISOString();
    await ctx.db.patch(args.productId, {
      title: args.title,
      description: args.description,
      price: args.price,
      image: args?.image ? (args.image as Id<"assets">) : undefined,
      model: args?.model ? (args?.model as Id<"assets">) : undefined,
      status: args.status,
      packaging: args.packaging,
      categoryId: args.categoryId,
      updatedAt: now,
    });
  },
});

/**
 * Deletes a product.
 *
 * @param {object} args - The arguments for the mutation.
 * @param {string} args.productId - The ID of the product to delete.
 * @throws {ConvexError} If the product is currently in use in a store.
 */
export const deleteProduct = mutation({
  args: {
    productId: v.id("products"),
  },
  handler: async (ctx, args) => {
    //check productBy Store
    const productExistInStore = await ctx.db
      .query("productsByStore")
      .withIndex("byProduct", (q) => q.eq("productId", args.productId))
      .first();
    if (productExistInStore)
      throw new ConvexError("Product is used in a store");
    await ctx.db.delete(args.productId);
  },
});

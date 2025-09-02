/**
 * Functions for managing assets, including adding, retrieving, updating, and deleting assets.
 */
import { mutation, query } from "./_generated/server";
import { ConvexError, v } from "convex/values";

/**
 * Adds a new asset to the database.
 *
 * @param {object} args - The arguments for the mutation.
 * @param {string} args.name - The name of the asset.
 * @param {string} args.storageId - The ID of the asset in the storage.
 * @param {boolean} args.isModel - A flag indicating whether the asset is a model.
 * @throws {ConvexError} If the asset fails to be added.
 */
export const addAsset = mutation({
  args: {
    name: v.string(),
    storageId: v.id("_storage"),
    isModel: v.boolean(),
  },
  handler: (ctx, args) => {
    try {
      const now = new Date().toISOString();
      ctx.db.insert("assets", {
        name: args.name,
        storageId: args.storageId,
        isModel: args.isModel,
        createdAt: now,
        updatedAt: now,
      });
    } catch (error) {
      if (error instanceof ConvexError) {
        throw error;
      }
      throw new ConvexError("Failed to add asset");
    }
  },
});

/**
 * Retrieves all assets from the database, including their URLs.
 *
 * @returns {Array<object>} An array of asset objects, each containing asset details and the asset URL.
 */
export const getAssets = query({
  handler: async (ctx) => {
    const assets = await ctx.db.query("assets").collect();
    const richAssets = await Promise.all(
      assets.map(async (asset) => {
        const url = await ctx.storage.getUrl(asset.storageId);
        return {
          ...asset,
          url,
        };
      })
    );
    return richAssets;
  },
});

/**
 * Generates a URL for uploading an asset to the storage.
 *
 * @returns {string} The URL for uploading an asset.
 */
export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

/**
 * Updates an existing asset in the database.
 *
 * @param {object} args - The arguments for the mutation.
 * @param {string} args.id - The ID of the asset to update.
 * @param {string} args.name - The new name of the asset.
 * @param {string} args.prevStorageId - The previous storage ID of the asset.
 * @param {string} args.storageId - The new storage ID of the asset.
 * @param {boolean} args.isModel - The new value for the isModel flag.
 * @throws {ConvexError} If the asset fails to be updated.
 */
export const updateAsset = mutation({
  args: {
    id: v.id("assets"),
    name: v.string(),
    prevStorageId: v.id("_storage"),
    storageId: v.id("_storage"),
    isModel: v.boolean(),
  },
  handler: async (ctx, args) => {
    try {
      await ctx.storage.delete(args.prevStorageId);
      const now = new Date().toISOString();
      await ctx.db.patch(args.id, {
        name: args.name,
        storageId: args.storageId,
        isModel: args.isModel,
        updatedAt: now,
      });
    } catch (error) {
      if (error instanceof ConvexError) {
        throw error;
      }
      throw new ConvexError("Failed to update asset");
    }
  },
});

/**
 * Deletes an asset from the database and storage.
 *
 * @param {object} args - The arguments for the mutation.
 * @param {string} args.assetId - The ID of the asset to delete.
 * @throws {ConvexError} If the asset is in use by a product.
 */
export const deleteAsset = mutation({
  args: {
    assetId: v.id("assets"),
  },
  handler: async (ctx, args) => {
    const asset = await ctx.db.get(args.assetId);
    if (!asset) return;
    const products = await ctx.db
      .query("products")
      .withIndex("byImage", (q) => q.eq("image", asset._id))
      .collect();
    if (products.length > 0)
      throw new ConvexError("Asset is in use by a product");
    const models = await ctx.db
      .query("products")
      .withIndex("model", (q) => q.eq("model", asset._id))
      .collect();
    if (models.length > 0)
      throw new ConvexError("Asset is in use by a product");
    await ctx.storage.delete(asset.storageId);
    await ctx.db.delete(args.assetId);
  },
});

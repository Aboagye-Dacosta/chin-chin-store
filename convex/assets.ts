import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const addAsset = mutation({
    args: {
        name: v.string(),
        storageId: v.id("_storage"),
        isModel: v.boolean(),
    },
    handler: (ctx, args) => {
        const now = new Date().toISOString();
        ctx.db.insert("assets", {
            name: args.name,
            storageId: args.storageId,
            isModel: args.isModel,
            createdAt: now,
            updatedAt: now,
        });
    },
})

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
})

export const generateUploadUrl = mutation({
    handler: async (ctx) => {
      return await ctx.storage.generateUploadUrl();
    },
});
import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const getStores = query({
  handler: async (ctx) => {
    const stores = await ctx.db.query("stores").collect();
    return stores;
  },
});

export const addStore = mutation({
  args: {
    name: v.string(),
    locationId: v.id("locations"),
    deliveryChargeId: v.optional(v.id("deliveryCharges")),
  },
  handler: async (ctx, args) => {
    const existingStore = await ctx.db
      .query("stores")
      .filter((q) => q.eq("name", args.name))
      .first();
    if (existingStore) {
      return {
        success: false,
        message: "Store already exists.",
      };
    }
    try {
      await ctx.db.insert("stores", {
        name: args.name,
        locationId: args.locationId,
        deliveryChargeId: args.deliveryChargeId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      return {
        success: true,
        message: "Store created successfully.",
      };
    } catch {
      return {
        success: false,
        message: "Failed to create store.",
      };
    }
  },
});

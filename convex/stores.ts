import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const getStores = query({
  handler: async (ctx) => {
    const stores = await ctx.db.query("stores").collect();
    const enrichedStores = await Promise.all(
      stores.map(async (store) => {
        const location = await ctx.db.get(store.locationId);
        const vendors = await ctx.db
          .query("vendors")
          .withIndex("byStore", (q) => q.eq("storeId", store._id))
          .collect();
        const products = await ctx.db
          .query("products")
          .withIndex("byStore", (q) => q.eq("storeId", store._id))
          .collect();
        const enrichedVendors = await Promise.all(
          vendors.map(async (vendor) => {
            const user = await ctx.db.get(vendor.userId);
            return {
              name: user?.name,
            };
          })
        );
        return {
          ...store,
          location,
          vendors: enrichedVendors,
          productCount: products.length,
        };
      })
    );
    return enrichedStores;
  },
});

export const addStore = mutation({
  args: {
    name: v.string(),
    locationId: v.id("locations"),
    deliveryCharge: v.float64(),
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
        deliveryCharge: args.deliveryCharge,
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

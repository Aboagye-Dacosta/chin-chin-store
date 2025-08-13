import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getLocations = query({
  handler: async (ctx) => {
    const locations = await ctx.db.query("locations").collect();
    return locations;
  },
});

export const addLocation = mutation({
  args: {
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const existingLocation = await ctx.db
      .query("locations")
      .filter((q) => q.eq("name", args.name))
      .first();

    if (existingLocation) {
      return {
        success: false,
        message: "Location already exists.",
      };
    }
    try {
      await ctx.db.insert("locations", {
        name: args.name,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      return {
        success: true,
        message: "Location created successfully.",
      };
    } catch {
      return {
        success: false,
        message: "Failed to create location.",
      };
    }
  },
});

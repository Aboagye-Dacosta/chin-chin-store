import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getCategories = query({
  handler: async (ctx) => {
    const categories = await ctx.db.query("categories").collect();
    return categories;
  },
});

export const addCategory = mutation({
  args: {
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const existingCategory = await ctx.db
      .query("categories")
      .withIndex("byName", (q) => q.eq("name", args.name))
      .first();
    if (existingCategory) {
      return {
        success: false,
        message: "Category already exists",
      };
    }
    try {
      const category = await ctx.db.insert("categories", {
        name: args.name,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      return {
        success: true,
        message: "Category added successfully",
        category,
      };
    } catch {
      return {
        success: false,
        message: "Failed to add category",
      };
    }
  },
});

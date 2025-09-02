/**
 * Functions for managing product categories.
 */
import { mutation, query } from "./_generated/server";
import { v, ConvexError } from "convex/values";

/**
 * Retrieves all product categories.
 *
 * @returns {Array<object>} An array of category objects.
 */
export const getCategories = query({
  handler: async (ctx) => {
    const categories = await ctx.db.query("categories").collect();
    return categories;
  },
});

/**
 * Adds a new product category.
 *
 * @param {object} args - The arguments for the mutation.
 * @param {string} args.name - The name of the category.
 * @param {string} [args.color] - The color of the category.
 * @returns {string} The ID of the new category.
 * @throws {ConvexError} If a category with the same name already exists.
 */
export const addCategory = mutation({
  args: {
    name: v.string(),
    color: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existingCategory = await ctx.db
      .query("categories")
      .withIndex("byName", (q) => q.eq("name", args.name))
      .first();
    if (existingCategory) {
      throw new ConvexError("Category already exists");
    }

    const now = new Date().toISOString();
    return await ctx.db.insert("categories", {
      name: args.name,
      color: args.color,
      createdAt: now,
      updatedAt: now,
    });
  },
});

/**
 * Updates the color of a product category.
 *
 * @param {object} args - The arguments for the mutation.
 * @param {string} args.id - The ID of the category to update.
 * @param {string} [args.color] - The new color of the category.
 */
export const updateCategory = mutation({
  args: {
    id: v.id("categories"),
    color: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();
    await ctx.db.patch(args.id, {
      color: args.color,
      updatedAt: now,
    });
  },
});

/**
 * Deletes a product category.
 *
 * @param {object} args - The arguments for the mutation.
 * @param {string} args.id - The ID of the category to delete.
 */
export const deleteCategory = mutation({
  args: {
    id: v.id("categories"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

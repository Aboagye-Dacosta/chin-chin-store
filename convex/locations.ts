/**
 * Functions for managing locations.
 */
import { mutation, query } from "./_generated/server";
import { v, ConvexError } from "convex/values";

/**
 * Retrieves all locations.
 *
 * @returns {Array<object>} An array of location objects.
 */
export const getLocations = query({
  handler: async (ctx) => {
    const locations = await ctx.db.query("locations").collect();
    return locations;
  },
});

/**
 * Adds a new location.
 *
 * @param {object} args - The arguments for the mutation.
 * @param {string} args.name - The name of the location.
 * @throws {ConvexError} If a location with the same name already exists.
 */
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
      throw new ConvexError("Location already exists.");
    }

    await ctx.db.insert("locations", {
      name: args.name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  },
});

/**
 * Deletes a location.
 *
 * @param {object} args - The arguments for the mutation.
 * @param {string} args.id - The ID of the location to delete.
 * @throws {ConvexError} If the location is currently in use by a store.
 */
export const deleteLocation = mutation({
  args: {
    id: v.id("locations"),
  },
  handler: async (ctx, args) => {
    const location = await ctx.db
      .query("stores")
      .withIndex("byLocation", (q) => q.eq("locationId", args.id))
      .first();
    if (location) {
      throw new ConvexError("Location is in use");
    }
    await ctx.db.delete(args.id);
  },
});

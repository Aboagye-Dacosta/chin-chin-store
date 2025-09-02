import { query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Retrieves the user's cart for a specific store.
 *
 * @param {object} args - The arguments for the query.
 * @param {string} [args.storeId] - The ID of the store to retrieve the cart for.
 * @returns {object|null} The cart object, or null if the user is not authenticated,
 * the store ID is not provided, or the cart does not exist.
 */
export const getCart = query({
  args: { storeId: v.optional(v.id("stores")) },
  handler: async (ctx, args) => {
    if (!args.storeId) return null;
    
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const clerkId = identity.subject;
    const user = await ctx.db
      .query("users")
      .withIndex("byClerkId", (q) => q.eq("clerkId", clerkId))
      .first();
    if (!user) return null;

    const cart = await ctx.db
      .query("carts")
      .withIndex("byUserAndStore", (q) =>
        q.eq("userId", user._id).eq("storeId", args.storeId!)
      )
      .first();

    return cart;
  },
});


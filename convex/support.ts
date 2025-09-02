/**
 * Functions for managing support contact information.
 */
import { v, ConvexError } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Adds new support contact information. Accessible only by SUPER_ADMIN.
 *
 * @param {object} args - The arguments for the mutation.
 * @param {string} args.email - The support email address.
 * @param {string} args.phone - The support phone number.
 * @param {string} args.address - The support address.
 * @param {string} args.operationHours - The support operation hours.
 * @returns {string} The ID of the newly created support entry.
 * @throws {ConvexError} If the user is not authenticated, user not found, or unauthorized.
 */
export const addSupport = mutation({
  args: {
    email: v.string(),
    phone: v.string(),
    address: v.string(),
    operationHours: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Not authenticated");
    const clerkId = identity.subject;
    const user = await ctx.db
      .query("users")
      .withIndex("byClerkId", (q) => q.eq("clerkId", clerkId))
      .first();
    if (!user) throw new ConvexError("User not found");

    if (user.role !== "SUPER_ADMIN") throw new ConvexError("Unauthorized");

    const now = new Date().toISOString();
    const support = await ctx.db.insert("support", {
      email: args.email,
      phone: args.phone,
      address: args.address,
      operationHours: args.operationHours,
      createdAt: now,
      updatedAt: now,
    });

    return support;
  },
});

/**
 * Retrieves the support contact information.
 *
 * @returns {object|null} The support contact information object, or null if not found.
 */
export const getSupport = query({
  handler: async (ctx) => {
    const support = await ctx.db.query("support").first();
    return support;
  },
});

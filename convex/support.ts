import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const addSupport = mutation({
  args: {
    email: v.string(),
    phone: v.string(),
    address: v.string(),
    operationHours: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const clerkId = identity.subject;
    const user = await ctx.db
      .query("users")
      .withIndex("byClerkId", (q) => q.eq("clerkId", clerkId))
      .first();
    if (!user) throw new Error("User not found");

    if (user.role !== "SUPER_ADMIN") throw new Error("Unauthorized");

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

export const getSupport = query({
  handler: async (ctx) => {
    const support = await ctx.db.query("support").first();
    return support;
  },
});

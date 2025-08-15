import { v } from "convex/values";
import { internalQuery, mutation, query } from "../convex/_generated/server";
import { Role } from "./schema";

export const upsertUserFromClerk = mutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),
    emailVerified: v.boolean(),
    updatedAt: v.string(),
  },
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("byClerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();

    const userData = {
      clerkId: args.clerkId,
      email: args.email,
      name: args.name,
      role: "USER",
      createdAt: new Date().toISOString(),
      updatedAt: args.updatedAt,
    };

    if (existingUser) {
      await ctx.db.patch(existingUser._id, {
        email: args.email,
        name: args.name,
        updatedAt: args.updatedAt,
      });
      return existingUser._id;
    } else {
      return await ctx.db.insert("users", {
        ...userData,
        role: "USER",
      });
    }
  },
});

export const getCurrentUser = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const clerkId = identity.subject;
    const user = await ctx.db
      .query("users")
      .withIndex("byClerkId", (q) => q.eq("clerkId", clerkId))
      .first();

    if (!user) throw new Error("User not found");
    return user;
  },
});

export const getUser = query({
  args: {
    userId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    if (!args.userId) return null;
    const user = await ctx.db.get(args.userId);

    if (!user) throw new Error("User not found");
    return user;
  },
});

export const getAllUsers = query({
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    return users;
  },
});

export const readUserById = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    return user;
  },
});

export const getUserByRole = query({
  args: {
    role: Role,
  },
  handler: async (ctx, args) => {
    const users = await ctx.db
      .query("users")
      .withIndex("byRole", (q) => q.eq("role", args.role))
      .collect();
    return users;
  },
});



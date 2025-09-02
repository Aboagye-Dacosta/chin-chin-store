/**
 * Functions for managing users and user-related data.
 */
import { v, ConvexError } from "convex/values";
import {
  internalQuery,
  mutation,
  query,
  internalMutation,
} from "../convex/_generated/server";
import { Role } from "./schema";
import { internal } from "./_generated/api";

/**
 * Inserts or updates a user record from Clerk data.
 *
 * @param {object} args - The arguments for the mutation.
 * @param {string} args.clerkId - The Clerk ID of the user.
 * @param {string} args.email - The email address of the user.
 * @param {string} args.name - The name of the user.
 * @param {boolean} args.emailVerified - Whether the user's email is verified.
 * @param {string} args.updatedAt - The last updated timestamp from Clerk.
 * @returns {string} The ID of the upserted user.
 */
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
      const userId = await ctx.db.insert("users", {
        ...userData,
        role: "USER",
      });
      await ctx.scheduler.runAfter(0, internal.users.updateUserAnalytics, {});
      return userId;
    }
  },
});

/**
 * Updates user analytics data, specifically for new customer count.
 */
export const updateUserAnalytics = internalMutation({
  handler: async (ctx) => {
    const today = new Date().toISOString().split("T")[0];

    let userAnalytics = await ctx.db
      .query("userAnalytics")
      .withIndex("byDate", (q) => q.eq("date", today))
      .first();

    if (userAnalytics) {
      await ctx.db.patch(userAnalytics._id, {
        newCustomers: userAnalytics.newCustomers + 1,
      });
    } else {
      await ctx.db.insert("userAnalytics", {
        date: today,
        newCustomers: 1,
        activeUsers: 0, // Active users will be updated separately
      });
    }
  },
});

/**
 * Retrieves the current authenticated user's details.
 *
 * @returns {object|null} The user object, or null if not authenticated.
 */
export const getCurrentUser = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const clerkId = identity.subject;
    const user = await ctx.db
      .query("users")
      .withIndex("byClerkId", (q) => q.eq("clerkId", clerkId))
      .first();

    if (!user) return null;
    return user;
  },
});

/**
 * Retrieves a user by their ID.
 *
 * @param {object} args - The arguments for the query.
 * @param {string} [args.userId] - The ID of the user to retrieve.
 * @returns {object|null} The user object, or null if not found.
 * @throws {ConvexError} If the user is not found.
 */
export const getUser = query({
  args: {
    userId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    if (!args.userId) return null;
    const user = await ctx.db.get(args.userId);

    if (!user) throw new ConvexError("User not found");
    return user;
  },
});

/**
 * Retrieves all users.
 *
 * @returns {Array<object>} An array of user objects.
 */
export const getAllUsers = query({
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    return users;
  },
});

/**
 * Reads a user by their ID (internal query).
 *
 * @param {object} args - The arguments for the internal query.
 * @param {string} args.userId - The ID of the user to read.
 * @returns {object|null} The user object, or null if not found.
 */
export const readUserById = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    return user;
  },
});

/**
 * Retrieves users by their role.
 *
 * @param {object} args - The arguments for the query.
 * @param {string} args.role - The role to filter users by.
 * @returns {Array<object>} An array of user objects with the specified role.
 */
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

/**
 * Retrieves the addresses associated with the current authenticated user.
 *
 * @returns {object|null} The address object, or null if not authenticated or user not found.
 * @throws {ConvexError} If the user is not authenticated or user not found.
 */
export const getUserAddresses = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Not authenticated");
    const clerkId = identity.subject;
    const user = await ctx.db
      .query("users")
      .withIndex("byClerkId", (q) => q.eq("clerkId", clerkId))
      .first();
    if (!user) throw new ConvexError("User not found");
    const addresses = await ctx.db
      .query("addresses")
      .withIndex("byUser", (q) => q.eq("userId", user._id))
      .first();
    return addresses;
  },
});

/**
 * Adds a new address for the current authenticated user.
 *
 * @param {object} args - The arguments for the mutation.
 * @param {string} args.deliveryAddress - The delivery address.
 * @param {string} [args.deliveryAddressNote] - A note for the delivery address.
 * @param {boolean} args.isDefault - Whether this address is the default.
 * @throws {ConvexError} If the user is not authenticated or user not found.
 */
export const addAddress = mutation({
  args: {
    deliveryAddress: v.string(),
    deliveryAddressNote: v.optional(v.string()),
    isDefault: v.boolean(),
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
    const now = new Date().toISOString();
    await ctx.db.insert("addresses", {
      userId: user._id,
      deliveryAddress: args.deliveryAddress,
      deliveryAddressNote: args.deliveryAddressNote,
      isDefault: args.isDefault,
      createdAt: now,
      updatedAt: now,
    });
  },
});

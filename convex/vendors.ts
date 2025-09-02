/**
 * Functions for managing vendors.
 */
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import {
  internalMutation,
  internalQuery,
  mutation,
  query,
  QueryCtx,
} from "./_generated/server";
import { v, ConvexError } from "convex/values";
import { PaymentNetwork, VendorStatus } from "./schema";

/**
 * Retrieves all vendors, enriching them with user details.
 *
 * @returns {Array<object>} An array of enriched vendor objects.
 */
export const getAllVendors = query({
  handler: async (ctx) => {
    const vendors = await ctx.db.query("vendors").collect();
    const allVendorsWithName = await Promise.all(
      vendors
        .filter((vendor) =>
          vendor?.status ? vendor?.status === "ACTIVE" : true
        )
        .map(async (vendor) => {
          const user = await ctx.db.get(vendor.userId);
          return {
            ...vendor,
            user,
          };
        })
    );
    return allVendorsWithName;
  },
});

/**
 * Retrieves vendors for a specific store, enriching them with user details.
 *
 * @param {object} args - The arguments for the query.
 * @param {string} [args.storeId] - The ID of the store to retrieve vendors for.
 * @returns {Array<object>|null} An array of enriched vendor objects, or null if storeId is not provided.
 */
export const getVendors = query({
  args: {
    storeId: v.optional(v.id("stores")),
  },
  handler: async (ctx, args) => {
    if (!args.storeId) {
      return null;
    }
    const vendors = await ctx.db
      .query("vendors")
      .withIndex("byStore", (q) => q.eq("storeId", args.storeId!))
      .collect();

    const allVendorsWithName = await Promise.all(
      vendors.map(async (vendor) => {
        const user = await ctx.db.get(vendor.userId);
        return {
          ...vendor,
          user,
        };
      })
    );

    return allVendorsWithName;
  },
});

/**
 * Adds a new vendor.
 *
 * @param {object} args - The arguments for the mutation.
 * @param {string} args.storeId - The ID of the store the vendor belongs to.
 * @param {string} args.userId - The ID of the user associated with the vendor.
 * @param {object} args.mobileMoneyAccounts - Mobile money account details.
 * @param {string} args.mobileMoneyAccounts.provider - The mobile money provider.
 * @param {string} args.mobileMoneyAccounts.phoneNumber - The mobile money phone number.
 * @returns {string} The ID of the newly created vendor.
 * @throws {ConvexError} If the user is not authenticated or if the vendor already exists.
 */
export const addVendor = mutation({
  args: {
    storeId: v.id("stores"),
    userId: v.id("users"),
    mobileMoneyAccounts: v.object({
      provider: PaymentNetwork,
      phoneNumber: v.string(),
    }),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Not authenticated");
    const clerkId = identity.subject;

    const existingVendor = await ctx.db
      .query("vendors")
      .withIndex("byUser", (q) => q.eq("userId", args.userId))
      .first();

    if (existingVendor) {
      throw new ConvexError("Vendor already exists.");
    }

    const vendorId = await ctx.db.insert("vendors", {
      userId: args.userId,
      storeId: args.storeId,
      role: "VENDOR",
      mobileMoney: args.mobileMoneyAccounts,
      clerkId: clerkId,
      status: "ACTIVE",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    await ctx.db.patch(args.userId, {
      role: "VENDOR",
    });

    await ctx.scheduler.runAfter(
      0,
      internal.createTransferRecipient.createSubaccount,
      {
        vendorId,
      }
    );

    return vendorId;
  },
});

/**
 * Retrieves a vendor by their ID.
 *
 * @param {object} args - The arguments for the query.
 * @param {string} [args.vendorId] - The ID of the vendor to retrieve.
 * @returns {object|null} The vendor object, or null if vendorId is not provided.
 */
export const getVendorById = query({
  args: {
    vendorId: v.optional(v.id("vendors")),
  },
  handler: async (ctx, args) => {
    if (!args.vendorId) {
      return null;
    }
    const vendor = await ctx.db.get(args.vendorId);
    return vendor;
  },
});

/**
 * Retrieves a vendor by their user ID.
 *
 * @param {object} args - The arguments for the query.
 * @param {string} [args.userId] - The ID of the user associated with the vendor.
 * @returns {object|null} The vendor object, or null if userId is not provided.
 */
export const getVendorByUserId = query({
  args: {
    userId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    if (!args.userId) {
      return null;
    }
    const vendor = await ctx.db
      .query("vendors")
      .withIndex("byUser", (q) => q.eq("userId", args.userId!))
      .first();
    return vendor;
  },
});

/**
 * Updates a vendor's Paystack recipient code (internal mutation).
 *
 * @param {object} args - The arguments for the internal mutation.
 * @param {string} args.vendorId - The ID of the vendor to update.
 * @param {string} args.recipientCode - The Paystack recipient code.
 */
export const updateVendorRecipientCode = internalMutation({
  args: {
    vendorId: v.id("vendors"),
    recipientCode: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.vendorId, {
      paystackRecipientCode: args.recipientCode,
    });
  },
});

/**
 * Reads a vendor by ID and enriches it with user details (internal query).
 *
 * @param {object} args - The arguments for the internal query.
 * @param {string} args.vendorId - The ID of the vendor to read.
 * @returns {object|null} The enriched vendor object, or null if not found.
 * @throws {ConvexError} If the vendor or associated user is not found.
 */
export const readVendorById = internalQuery({
  args: { vendorId: v.id("vendors") },
  handler: async (ctx, args) => {
    const vendor = await ctx.db.get(args.vendorId);
    if (!vendor) throw new ConvexError("Vendor not found");
    const user = await getUser(ctx, vendor.userId);
    if (!user) throw new ConvexError("User not found for vendor");
    return {
      ...vendor,
      user,
    };
  },
});

/**
 * Helper function to get a user by ID.
 *
 * @param {object} ctx - The Convex query context.
 * @param {string|null} userId - The ID of the user to retrieve.
 * @returns {object|null} The user object, or null if not found.
 */
async function getUser(ctx: QueryCtx, userId: Id<"users"> | null) {
  if (userId === null) {
    return null;
  }
  return await ctx.db.get(userId);
}

/**
 * Updates an existing vendor.
 *
 * @param {object} args - The arguments for the mutation.
 * @param {string} args.vendorId - The ID of the vendor to update.
 * @param {string} args.userId - The new ID of the user associated with the vendor.
 * @param {string} args.storeId - The new ID of the store the vendor belongs to.
 * @param {object} args.mobileMoneyAccounts - New mobile money account details.
 * @param {string} args.mobileMoneyAccounts.provider - The mobile money provider.
 * @param {string} args.mobileMoneyAccounts.phoneNumber - The mobile money phone number.
 */
export const updateVendor = mutation({
  args: {
    vendorId: v.id("vendors"),
    userId: v.id("users"),
    storeId: v.id("stores"),
    mobileMoneyAccounts: v.object({
      provider: PaymentNetwork,
      phoneNumber: v.string(),
    }),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.vendorId, {
      userId: args.userId,
      storeId: args.storeId,
      mobileMoney: args.mobileMoneyAccounts,
    });
  },
});

/**
 * Deletes a vendor.
 *
 * @param {object} args - The arguments for the mutation.
 * @param {string} args.vendorId - The ID of the vendor to delete.
 * @throws {ConvexError} If the vendor has associated orders.
 */
export const deleteVendor = mutation({
  args: {
    vendorId: v.id("vendors"),
  },
  handler: async (ctx, args) => {
    //check whether and other with a vendor exist
    const order = await ctx.db
      .query("orders")
      .withIndex("byVendor", (q) => q.eq("vendorId", args.vendorId ?? ""))
      .first();
    if (order) throw new ConvexError("Vendor has orders");
    await ctx.db.delete(args.vendorId);
  },
});

/**
 * Updates a vendor's status.
 *
 * @param {object} args - The arguments for the mutation.
 * @param {string} args.vendorId - The ID of the vendor to update.
 * @param {string} args.status - The new status of the vendor.
 */
export const updateVendorStatus = mutation({
  args: {
    vendorId: v.id("vendors"),
    status: VendorStatus,
  },
  async handler(ctx, args) {
    await ctx.db.patch(args.vendorId, {
      status: args.status,
      updatedAt: new Date().toISOString(),
    });
  },
});

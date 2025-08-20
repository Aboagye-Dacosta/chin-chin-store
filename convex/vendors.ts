import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import {
  internalMutation,
  internalQuery,
  mutation,
  query,
  QueryCtx,
} from "./_generated/server";
import { v } from "convex/values";
import { PaymentNetwork } from "./schema";

export const getAllVendors = query({
  handler: async (ctx) => {
    const vendors = await ctx.db.query("vendors").collect();
    return vendors;
  },
});

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
    if (!identity) return null;
    const clerkId = identity.subject;
    try {
      const existingVendor = await ctx.db
        .query("vendors")
        .withIndex("byUser", (q) => q.eq("userId", args.userId))
        .first();

      if (existingVendor) {
        return {
          success: false,
          message: "Vendor already exists.",
        };
      }

      const vendorId = await ctx.db.insert("vendors", {
        userId: args.userId,
        storeId: args.storeId,
        role: "VENDOR",
        mobileMoney: args.mobileMoneyAccounts,
        clerkId: clerkId,
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

      return {
        success: true,
        message: "Vendor added successfully.",
      };
    } catch {
      return {
        success: false,
        message: "Failed to add vendor.",
      };
    }
  },
});

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

export const readVendorById = internalQuery({
  args: { vendorId: v.id("vendors") },
  handler: async (ctx, args) => {
    const vendor = await ctx.db.get(args.vendorId);
    const user = await getUser(ctx, vendor?.userId!);
    return {
      ...vendor,
      user,
    };
  },
});

async function getUser(ctx: QueryCtx, userId: Id<"users"> | null) {
  if (userId === null) {
    return null;
  }
  return await ctx.db.get(userId);
}

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getAllDeliveryCharges = query({
  handler: async (ctx) => {
    const deliveryCharges = await ctx.db.query("deliveryCharges").collect();
    return deliveryCharges;
  },
});

export const getDeliveryCharge = query({
  args: {
    storeId: v.optional(v.id("stores")),
  },
  handler: async (ctx, args) => {
    if (!args.storeId) return null;
    const deliveryCharge = await ctx.db
      .query("deliveryCharges")
      .withIndex("byStore", (q) => q.eq("storeId", args.storeId!))
      .first();
    return deliveryCharge;
  },
});

export const addDeliveryCharge = mutation({
  args: {
    amount: v.float64(),
    storeId: v.id("stores"),
  },
  handler: async (ctx, args) => {
    try {
      await ctx.db.insert("deliveryCharges", {
        amount: args.amount,
        storeId: args.storeId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      return { success: true, message: "Delivery charge added successfully." };
    } catch {
      return { success: false, message: "Failed to add delivery charge." };
    }
  },
});

export const updateDeliveryCharge = mutation({
  args: {
    id: v.id("deliveryCharges"),
    amount: v.float64(),
    storeId: v.id("stores"),
  },
  handler: async (ctx, args) => {
    try {
      await ctx.db.patch(args.id, {
        amount: args.amount,
        storeId: args.storeId,
        updatedAt: new Date().toISOString(),
      });
      return { success: true, message: "Delivery charge updated successfully." };
    } catch {
      return { success: false, message: "Failed to update delivery charge." };
    }
  },
});

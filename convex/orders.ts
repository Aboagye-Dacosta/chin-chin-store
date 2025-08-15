import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { OrderStatus } from "./schema";

export const getAllOrders = query({
  handler: async (ctx) => {
    const orders = await ctx.db.query("orders").collect();
    return orders;
  },
});

export const getOrdersByStore = query({
  args: {
    storeId: v.id("stores"),
  },
  handler: async (ctx, args) => {
    const orders = await ctx.db
      .query("orders")
      .withIndex("byStore", (q) => q.eq("storeId", args.storeId))
      .collect();
    return orders;
  },
});

export const getOrdersByVendor = query({
  args: {
    vendorId: v.id("vendors"),
  },
  handler: async (ctx, args) => {
    const orders = await ctx.db
      .query("orders")
      .withIndex("byVendor", (q) => q.eq("vendorId", args.vendorId))
      .collect();
    return orders;
  },
});

export const getOrdersByUser = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const orders = await ctx.db
      .query("orders")
      .withIndex("byUser", (q) => q.eq("userId", args.userId))
      .collect();
    return orders;
  },
});

export const getOrderById = query({
  args: {
    orderId: v.id("orders"),
  },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);
    return order;
  },
});

export const createOrder = mutation({
  args: {
    userId: v.id("users"),
    storeId: v.id("stores"),
    orderId: v.string(),
    vendorId: v.id("vendors"),
    amount: v.number(),
    method: v.union(
      v.literal("MOBILE_MONEY"),
      v.literal("PAYMENT_ON_DELIVERY"),
      v.literal("CARD")
    ),
    trackingNumber: v.optional(v.string()),

    deliveryAddressLabel: v.string(),
    deliveryNote: v.optional(v.string()),
    status: OrderStatus,
  },
  handler: async (ctx, args) => {
    const order = await ctx.db.insert("orders", {
      userId: args.userId,
      storeId: args.storeId,
      vendorId: args.vendorId,
      total: args.amount,
      status: args.status,
      trackingNumber: args.trackingNumber,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deliveryAddressLabel: args.deliveryAddressLabel,
      deliveryNote: args.deliveryNote,
    });
    return order;
  },
});

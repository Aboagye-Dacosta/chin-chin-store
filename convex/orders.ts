import { internalMutation, mutation, query } from "./_generated/server";
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

export const getOrdersByStoreAndUser = query({
  args: {
    storeId: v.id("stores"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const clerkId = identity?.subject;
    if (!clerkId) return null;
    const user = await ctx.db
      .query("users")
      .withIndex("byClerkId", (q) => q.eq("clerkId", clerkId))
      .first();
    if (!user) return null;
    const orders = await ctx.db
      .query("orders")
      .withIndex("byUserAndStore", (q) =>
        q.eq("userId", user._id).eq("storeId", args.storeId)
      )
      .collect();

    const enrichedOrders = await Promise.all(
      orders.map(async (order) => {
        const payment = await ctx.db
          .query("payments")
          .withIndex("byOrder", (q) => q.eq("orderId", order._id))
          .first();

        const orderItems = await ctx.db
          .query("orderItems")
          .withIndex("byOrder", (q) => q.eq("orderId", order._id))
          .collect();

        const enrichedOrderItems = await Promise.all(
          orderItems.map(async (orderItem) => {
            const product = await ctx.db.get(orderItem.productId);
            return {
              ...orderItem,
              product,
            };
          })
        );

        const enrichedOrder = {
          ...order,
          payment,
          items: enrichedOrderItems,
        };

        return enrichedOrder;
      })
    );

    return enrichedOrders;
  },
});

export const getOrderById = query({
  args: {
    orderId: v.id("orders"),
  },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);

    const payment = await ctx.db
      .query("payments")
      .withIndex("byOrder", (q) => q.eq("orderId", args.orderId))
      .first();

    const orderItems = await ctx.db
      .query("orderItems")
      .withIndex("byOrder", (q) => q.eq("orderId", args.orderId))
      .collect();

    const enrichedOrderItems = await Promise.all(
      orderItems.map(async (orderItem) => {
        const product = await ctx.db.get(orderItem.productId);
        return {
          ...orderItem,
          product,
        };
      })
    );

    const enrichedOrder = {
      ...order,
      payment,
      items: enrichedOrderItems,
    };

    return enrichedOrder;
  },
});

export const createOrder = mutation({
  args: {
    userId: v.id("users"),
    storeId: v.id("stores"),
    vendorId: v.id("vendors"),
    deliveryCharge: v.optional(v.number()),
    amount: v.number(),
    method: v.union(
      v.literal("MOBILE_MONEY"),
      v.literal("PAYMENT_ON_DELIVERY"),
      v.literal("CARD")
    ),
    items: v.array(
      v.object({
        productId: v.id("products"),
        quantity: v.number(),
      })
    ),
    trackingNumber: v.string(),
    deliveryAddressLabel: v.string(),
    deliveryNote: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();
    const order = await ctx.db.insert("orders", {
      userId: args.userId,
      storeId: args.storeId,
      vendorId: args.vendorId,
      total: args.amount,
      status: "PENDING",
      trackingNumber: args.trackingNumber,
      createdAt: now,
      updatedAt: now,
      deliveryAddressLabel: args.deliveryAddressLabel,
      deliveryNote: args.deliveryNote,
      deliveryCharge: args.deliveryCharge,
    });

    await Promise.all(
      args.items.map(async (item) => {
        await ctx.db.insert("orderItems", {
          orderId: order,
          productId: item.productId,
          quantity: item.quantity,
          createdAt: now,
          updatedAt: now,
        });
      })
    );

    return order;
  },
});

export const updateOrderStatus = internalMutation({
  args: {
    orderId: v.id("orders"),
    status: OrderStatus,
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.orderId, {
      status: args.status,
      updatedAt: new Date().toISOString(),
    });
  },
});

export const cancelOrder = mutation({
  args: {
    orderId: v.id("orders"),
  },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);
    if (!order) {
      throw new Error("Order not found");
    }

    const now = new Date().toISOString();
    await ctx.db.patch(args.orderId, {
      status: "CANCELLED",
      updatedAt: now,
    });

    const payment = await ctx.db
      .query("payments")
      .withIndex("byOrder", (q) => q.eq("orderId", args.orderId))
      .first();
    if (!payment) {
      throw new Error("Payment not found");
    }

    //update payment status
    if(payment.method === "MOBILE_MONEY") {
      await ctx.db.patch(payment._id, {
        status: "ORDER_CANCELLED",
        updatedAt: now,
      });
    } else {
      await ctx.db.patch(payment._id, {
        status: "CANCELLED",
        updatedAt: now,
      });
    }

    //restore product stock
    const orderItems = await ctx.db
      .query("orderItems")
      .withIndex("byOrder", (q) => q.eq("orderId", args.orderId))
      .collect();

    await Promise.all(
      orderItems.map(async (item) => {
        const product = await ctx.db.get(item.productId);
        if (!product) return;
        await ctx.db.patch(product._id, {
          stock: product.stock + item.quantity,
          updatedAt: now,
        });
      })
    );
  },
});

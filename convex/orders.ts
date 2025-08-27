import { internalMutation, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { OrderStatus } from "./schema";
import { Id } from "./_generated/dataModel";

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
    orders: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const clerkId = identity?.subject;
    let orders;

    if (clerkId) {
      const user = await ctx.db
        .query("users")
        .withIndex("byClerkId", (q) => q.eq("clerkId", clerkId))
        .first();
      if (!user) return null;
      orders = await ctx.db
        .query("orders")
        .withIndex("byUserAndStore", (q) =>
          q.eq("userId", user._id).eq("storeId", args.storeId)
        )
        .collect();
    } else if (args.orders) {
      orders = await Promise.all(
        args.orders.map(async (orderId) => {
          return await ctx.db.get(orderId as Id<"orders">);
        })
      );
    }

    const enrichedOrders = await Promise.all(
      (orders ?? []).map(async (order) => {
        const payment = await ctx.db
          .query("payments")
          .withIndex("byOrder", (q) =>
            q.eq("orderId", order?._id as Id<"orders">)
          )
          .first();

        const orderItems = await ctx.db
          .query("orderItems")
          .withIndex("byOrder", (q) =>
            q.eq("orderId", order?._id as Id<"orders">)
          )
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
    userId: v.optional(v.id("users")),
    storeId: v.id("stores"),
    vendorId: v.id("vendors"),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
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
      name: args.name,
      email: args.email,
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
    storeId: v.id("stores"),
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
    if (payment.method === "MOBILE_MONEY") {
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
    const identity = await ctx.auth.getUserIdentity();
    if (identity) {
      const orderItems = await ctx.db
        .query("orderItems")
        .withIndex("byOrder", (q) => q.eq("orderId", args.orderId))
        .collect();

      await Promise.all(
        orderItems.map(async (item) => {
          const productByStore = await ctx.db
            .query("productsByStore")
            .withIndex("byStoreAndProduct", (q) =>
              q.eq("storeId", args.storeId).eq("productId", item.productId)
            )
            .first();
          if (!productByStore) return;
          await ctx.db.patch(productByStore._id, {
            quantity: productByStore.quantity + item.quantity,
            updatedAt: now,
          });
        })
      );
    }
  },
});

export const getAdminAndVendorsOrders = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    const clerkId = identity?.subject;
    if (!clerkId) return null;
    const user = await ctx.db
      .query("users")
      .withIndex("byClerkId", (q) => q.eq("clerkId", clerkId))
      .first();
    if (!user) return null;

    if (user.role === "SUPER_ADMIN") {
      const orders = await ctx.db.query("orders").collect();
      const enrichedOrders = await Promise.all(
        orders.map(async (order) => {
          let user;
          if (order.userId) {
            user = await ctx.db.get(order.userId);
          }
          const vendor = await ctx.db.get(order.vendorId);
          if (!vendor) return null;
          const vendorUser = await ctx.db.get(vendor.userId);
          const store = await ctx.db.get(order.storeId);

          return {
            ...order,
            user,
            vendor: vendorUser,
            store,
          };
        })
      );
      return enrichedOrders.filter((order) => order !== null);
    }

    if (user.role === "VENDOR") {
      const vendor = await ctx.db
        .query("vendors")
        .withIndex("byUser", (q) => q.eq("userId", user._id))
        .first();
      if (!vendor) return null;
      const orders = await ctx.db
        .query("orders")
        .withIndex("byVendor", (q) => q.eq("vendorId", vendor._id))
        .collect();

      const enrichedOrders = await Promise.all(
        orders.map(async (order) => {
          let user;
          if (order.userId) {
            user = await ctx.db.get(order.userId);
          }
          const vendor = await ctx.db.get(order.vendorId);
          if (!vendor) return null;
          const vendorUser = await ctx.db.get(vendor.userId);
          const store = await ctx.db.get(order.storeId);

          const enrichedOrder = {
            ...order,
            user,
            vendor: vendorUser,
            store,
          };
          return enrichedOrder;
        })
      );
      return enrichedOrders.filter((order) => order !== null);
    }

    return [];
  },
});

export const attachOrderToUser = mutation({
  args: {
    orders: v.array(v.string()),
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

    await Promise.all(
      args.orders.map(async (orderId) => {
        await ctx.db.patch(orderId as Id<"orders">, {
          userId: user._id,
        });
      })
    );
  },
});

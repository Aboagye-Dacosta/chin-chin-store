import { ConvexError, v } from "convex/values";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import { internalMutation, mutation, query } from "./_generated/server";
import { OrderStatus } from "./schema";

/**
 * Retrieves all orders.
 *
 * @returns {Array<object>} An array of order objects.
 */
export const getAllOrders = query({
  handler: async (ctx) => {
    const orders = await ctx.db.query("orders").collect();
    return orders;
  },
});

/**
 * Retrieves orders for a specific store.
 *
 * @param {object} args - The arguments for the query.
 * @param {string} args.storeId - The ID of the store to retrieve orders for.
 * @returns {Array<object>} An array of order objects.
 */
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

/**
 * Retrieves orders for a specific vendor.
 *
 * @param {object} args - The arguments for the query.
 * @param {string} args.vendorId - The ID of the vendor to retrieve orders for.
 * @returns {Array<object>} An array of order objects.
 */
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

/**
 * Retrieves orders for a specific store and user.
 *
 * @param {object} args - The arguments for the query.
 * @param {string} args.storeId - The ID of the store to retrieve orders for.
 * @param {Array<string>} [args.orders] - An optional array of order IDs.
 * @returns {Array<object>|null} An array of enriched order objects, or null if the user is not authenticated.
 */
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
            let image;
            if (product?.image) {
              const asset = await ctx.db.get(product.image);
              if (asset) {
                image = await ctx.storage.getUrl(asset?.storageId);
              }
            }
            return {
              ...orderItem,
              product: {
                ...product,
                image,
              },
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

/**
 * Retrieves an order by its ID.
 *
 * @param {object} args - The arguments for the query.
 * @param {string} args.orderId - The ID of the order to retrieve.
 * @returns {object} The enriched order object.
 */
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
        let image;
        if (product?.image) {
          const asset = await ctx.db.get(product.image);
          if (asset) {
            image = await ctx.storage.getUrl(asset?.storageId);
          }
        }
        return {
          ...orderItem,
          product: {
            ...product,
            image,
          },
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

/**
 * Creates a new order.
 *
 * @param {object} args - The arguments for the mutation.
 * @param {string} [args.userId] - The ID of the user who placed the order.
 * @param {string} args.storeId - The ID of the store the order belongs to.
 * @param {string} args.vendorId - The ID of the vendor the order belongs to.
 * @param {string} [args.name] - The name of the customer.
 * @param {string} [args.email] - The email of the customer.
 * @param {number} [args.deliveryCharge] - The delivery charge for the order.
 * @param {number} args.amount - The total amount of the order.
 * @param {string} args.method - The payment method for the order.
 * @param {Array<object>} args.items - An array of order items.
 * @param {string} args.trackingNumber - The tracking number for the order.
 * @param {string} args.deliveryAddressLabel - The delivery address label for the order.
 * @param {string} [args.deliveryNote] - A note for the delivery.
 * @returns {string} The ID of the new order.
 */
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

/**
 * Updates the status of an order (internal).
 *
 * @param {object} args - The arguments for the internal mutation.
 * @param {string} args.orderId - The ID of the order to update.
 * @param {string} args.status - The new status of the order.
 */
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

    if (args.status === "DELIVERED") {
      await ctx.scheduler.runAfter(0, internal.orders.updateAnalytics, {
        orderId: args.orderId,
      });
    }
  },
});

/**
 * Updates the status of an order.
 *
 * @param {object} args - The arguments for the mutation.
 * @param {string} args.orderId - The ID of the order to update.
 * @param {string} args.status - The new status of the order.
 */
export const updateStatus = mutation({
  args: {
    orderId: v.id("orders"),
    status: OrderStatus,
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.orderId, {
      status: args.status,
      updatedAt: new Date().toISOString(),
    });

    if (args.status === "DELIVERED") {
      await ctx.scheduler.runAfter(0, internal.orders.updateAnalytics, {
        orderId: args.orderId,
      });
    }
  },
});

/**
 * Updates analytics data when an order is delivered.
 *
 * @param {object} args - The arguments for the internal mutation.
 * @param {string} args.orderId - The ID of the order.
 */
export const updateAnalytics = internalMutation({
  args: {
    orderId: v.id("orders"),
  },
  handler: async (ctx, { orderId }) => {
    const order = await ctx.db.get(orderId);
    if (!order) {
      return;
    }

    const today = new Date().toISOString().split("T")[0];

    // Update sales analytics
    let salesAnalytics = await ctx.db
      .query("salesAnalytics")
      .withIndex("byDate", (q) => q.eq("date", today))
      .first();

    if (salesAnalytics) {
      await ctx.db.patch(salesAnalytics._id, {
        totalRevenue: salesAnalytics.totalRevenue + order.total,
        totalOrders: salesAnalytics.totalOrders + 1,
      });
    } else {
      await ctx.db.insert("salesAnalytics", {
        date: today,
        totalRevenue: order.total,
        totalOrders: 1,
        storeId: order.storeId,
      });
    }

    // Update product analytics
    const orderItems = await ctx.db
      .query("orderItems")
      .withIndex("byOrder", (q) => q.eq("orderId", orderId))
      .collect();

    for (const item of orderItems) {
      const product = await ctx.db.get(item.productId);
      if (!product) continue;

      let productAnalytics = await ctx.db
        .query("productAnalytics")
        .withIndex("byProduct", (q) => q.eq("productId", item.productId))
        .first();

      if (productAnalytics) {
        await ctx.db.patch(productAnalytics._id, {
          totalSold: productAnalytics.totalSold + item.quantity,
          totalRevenue:
            productAnalytics.totalRevenue + product.price * item.quantity,
        });
      } else {
        await ctx.db.insert("productAnalytics", {
          productId: item.productId,
          totalSold: item.quantity,
          totalRevenue: product.price * item.quantity,
        });
      }
    }

    // Update store analytics
    let storeAnalytics = await ctx.db
      .query("storeAnalytics")
      .withIndex("byStore", (q) => q.eq("storeId", order.storeId))
      .first();

    if (storeAnalytics) {
      await ctx.db.patch(storeAnalytics._id, {
        totalRevenue: storeAnalytics.totalRevenue + order.total,
        totalOrders: storeAnalytics.totalOrders + 1,
      });
    } else {
      await ctx.db.insert("storeAnalytics", {
        storeId: order.storeId,
        totalRevenue: order.total,
        totalOrders: 1,
      });
    }
  },
});

/**
 * Updates analytics data when an order is refunded.
 *
 * @param {object} args - The arguments for the internal mutation.
 * @param {string} args.orderId - The ID of the order.
 */
export const updateAnalyticsForRefund = internalMutation({
  args: {
    orderId: v.id("orders"),
  },
  handler: async (ctx, { orderId }) => {
    const order = await ctx.db.get(orderId);
    if (!order) {
      return;
    }

    const today = new Date().toISOString().split("T")[0];

    // Update sales analytics
    let salesAnalytics = await ctx.db
      .query("salesAnalytics")
      .withIndex("byDate", (q) => q.eq("date", today))
      .first();

    if (salesAnalytics) {
      await ctx.db.patch(salesAnalytics._id, {
        totalRevenue: salesAnalytics.totalRevenue - order.total,
        totalOrders: salesAnalytics.totalOrders - 1,
      });
    }

    // Update product analytics
    const orderItems = await ctx.db
      .query("orderItems")
      .withIndex("byOrder", (q) => q.eq("orderId", orderId))
      .collect();

    for (const item of orderItems) {
      const product = await ctx.db.get(item.productId);
      if (!product) continue;

      let productAnalytics = await ctx.db
        .query("productAnalytics")
        .withIndex("byProduct", (q) => q.eq("productId", item.productId))
        .first();

      if (productAnalytics) {
        await ctx.db.patch(productAnalytics._id, {
          totalSold: productAnalytics.totalSold - item.quantity,
          totalRevenue:
            productAnalytics.totalRevenue - product.price * item.quantity,
        });
      }
    }

    // Update store analytics
    let storeAnalytics = await ctx.db
      .query("storeAnalytics")
      .withIndex("byStore", (q) => q.eq("storeId", order.storeId))
      .first();

    if (storeAnalytics) {
      await ctx.db.patch(storeAnalytics._id, {
        totalRevenue: storeAnalytics.totalRevenue - order.total,
        totalOrders: storeAnalytics.totalOrders - 1,
      });
    }
  },
});

/**
 * Retrieves orders for admin and vendors.
 *
 * @returns {Array<object>|null} An array of enriched order objects, or null if the user is not authenticated.
 */
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

/**
 * Attaches an order to a user.
 *
 * @param {object} args - The arguments for the mutation.
 * @param {Array<string>} args.orders - An array of order IDs to attach to the user.
 * @returns {void|null} Null if the user is not authenticated.
 */
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

/**
 * Cancels an order.
 *
 * @param {object} args - The arguments for the mutation.
 * @param {string} args.orderId - The ID of the order to cancel.
 * @param {string} args.storeId - The ID of the store the order belongs to.
 * @throws {ConvexError} If the order or payment is not found.
 */
export const cancelOrder = mutation({
  args: {
    orderId: v.id("orders"),
    storeId: v.id("stores"),
  },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);
    if (!order) {
      throw new ConvexError("Order not found");
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
      throw new ConvexError("Payment not found");
    }

    //update payment status
    if (payment.method === "MOBILE_MONEY") {
      await ctx.db.patch(payment._id, {
        status: "REFUND_REQUESTED",
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

    if (!identity) {
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

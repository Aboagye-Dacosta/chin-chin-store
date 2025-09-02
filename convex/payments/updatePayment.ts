/**
 * Functions for updating payment statuses and handling payment completion.
 */
import { internalMutation, mutation } from "../_generated/server";
import { v, ConvexError } from "convex/values";
import { PaymentStatus } from "../schema";
import { internal } from "../_generated/api";

/**
 * Updates the status of a payment (internal mutation).
 *
 * @param {object} args - The arguments for the internal mutation.
 * @param {string} args.paymentId - The ID of the payment to update.
 * @param {string} args.status - The new status of the payment.
 */
export const internalUpdateStatus = internalMutation({
  args: {
    paymentId: v.id("payments"),
    status: PaymentStatus,
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.paymentId, {
      status: args.status,
      updatedAt: new Date().toISOString(),
    });

    if (args.status === "REFUNDED") {
      const payment = await ctx.db.get(args.paymentId);
      if (payment) {
        await ctx.scheduler.runAfter(
          0,
          internal.orders.updateAnalyticsForRefund,
          { orderId: payment.orderId }
        );
      }
    }
  },
});

/**
 * Updates the status of a payment.
 *
 * @param {object} args - The arguments for the mutation.
 * @param {string} args.paymentId - The ID of the payment to update.
 * @param {string} args.status - The new status of the payment.
 */
export const updateStatus = mutation({
  args: {
    paymentId: v.id("payments"),
    status: PaymentStatus,
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.paymentId, {
      status: args.status,
      updatedAt: new Date().toISOString(),
    });

    if (args.status === "REFUNDED") {
      const payment = await ctx.db.get(args.paymentId);
      if (payment) {
        await ctx.scheduler.runAfter(
          0,
          internal.orders.updateAnalyticsForRefund,
          { orderId: payment.orderId }
        );
      }
    }
  },
});

/**
 * Completes a payment, updates order status, and manages product stock.
 *
 * @param {object} args - The arguments for the internal mutation.
 * @param {string} args.paymentId - The ID of the payment to complete.
 * @param {string} args.orderId - The ID of the associated order.
 * @param {string} [args.cartId] - The ID of the cart (optional).
 * @param {string} args.storeId - The ID of the store.
 * @throws {ConvexError} If there's not enough stock for a product or if payment completion fails.
 */
export const completePayment = internalMutation({
  args: {
    paymentId: v.id("payments"),
    orderId: v.id("orders"),
    cartId: v.optional(v.id("carts")),
    storeId: v.id("stores"),
  },
  handler: async (ctx, args) => {
    try {
      const now = new Date().toISOString();
      await ctx.db.patch(args.paymentId, {
        status: "PAID",
        updatedAt: now,
      });

      //update order status
      await ctx.db.patch(args.orderId, {
        status: "PROCESSING",
        updatedAt: now,
      });

      //delete cart items and updates product stock
      const identity = await ctx.auth.getUserIdentity();
      if (args.cartId && identity) {
        const cartItems = await ctx.db
          .query("cartItems")
          .withIndex("byCart", (q) => q.eq("cartId", args.cartId!))
          .collect();

        await Promise.all(
          cartItems.map(async (item) => {
            const productByStore = await ctx.db
              .query("productsByStore")
              .withIndex("byStoreAndProduct", (q) =>
                q.eq("storeId", args.storeId).eq("productId", item.productId)
              )
              .first();
            if (!productByStore) return;
            const product = await ctx.db.get(productByStore.productId);
            if (!product) return;
            if (productByStore.quantity < item.quantity) {
              throw new ConvexError(`Not enough stock for ${product.title}`);
            }
            await ctx.db.patch(productByStore._id, {
              quantity: productByStore.quantity - item.quantity,
              updatedAt: now,
            });
            return await ctx.db.delete(item._id);
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
            const product = await ctx.db.get(productByStore.productId);
            if (!product) return;
            if (productByStore.quantity < item.quantity) {
              throw new ConvexError(`Not enough stock for ${product.title}`);
            }
            await ctx.db.patch(productByStore._id, {
              quantity: productByStore.quantity - item.quantity,
              updatedAt: now,
            });
            return await ctx.db.delete(item._id);
          })
        );
      }

      await ctx.scheduler.runAfter(0, internal.orders.updateAnalytics, {
        orderId: args.orderId,
      });

      return args.paymentId;
    } catch (error) {
      if (error instanceof ConvexError) {
        throw error;
      }
      throw new ConvexError("Failed to complete payment");
    }
  },
});

/**
 * Functions for adding payments.
 */
import { internalMutation, mutation } from "../_generated/server";
import { v, ConvexError } from "convex/values";

/**
 * Inserts a new payment record.
 *
 * @param {object} args - The arguments for the internal mutation.
 * @param {string} args.orderId - The ID of the associated order.
 * @param {number} args.amount - The payment amount.
 * @param {string} args.currency - The payment currency.
 * @param {string} args.method - The payment method.
 * @param {string} args.status - The payment status.
 * @param {string} [args.phoneNumber] - The phone number for mobile money payments.
 * @param {string} [args.mobileNetwork] - The mobile network for mobile money payments.
 * @param {string} [args.transactionId] - The transaction ID.
 * @param {string} [args.transactionReference] - The transaction reference.
 * @param {any} [args.metadata] - Additional metadata for the payment.
 * @param {string} args.paymentGatewaySettingsId - The ID of the payment gateway settings used.
 * @returns {string} The ID of the newly inserted payment.
 */
export const insert = internalMutation({
  args: {
    orderId: v.id("orders"),
    amount: v.float64(),
    currency: v.string(),
    method: v.union(
      v.literal("MOBILE_MONEY"),
      v.literal("PAYMENT_ON_DELIVERY"),
      v.literal("CARD")
    ),
    status: v.union(
      v.literal("PENDING"),
      v.literal("PAID"),
      v.literal("FAILED"),
      v.literal("REFUNDED"),
      v.literal("AWAITING_CONFIRMATION")
    ),
    phoneNumber: v.optional(v.string()),
    mobileNetwork: v.optional(
      v.union(v.literal("MTN"), v.literal("AIRTELTIGO"), v.literal("VODAFONE"))
    ),
    transactionId: v.optional(v.string()),
    transactionReference: v.optional(v.string()),
    metadata: v.optional(v.any()),
    paymentGatewaySettingsId: v.id("paymentGatewaySettings"),
  },
  handler: async (ctx, args) => {
    const paymentId = await ctx.db.insert("payments", {
      orderId: args.orderId,
      amount: args.amount,
      currency: args.currency,
      method: args.method,
      status: args.status,
      phoneNumber: args.phoneNumber,
      mobileNetwork: args.mobileNetwork,
      transactionId: args.transactionId,
      transactionReference: args.transactionReference,
      metadata: args.metadata,
      paymentGatewaySettingsId: args.paymentGatewaySettingsId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    return paymentId;
  },
});

/**
 * Handles "Pay on Delivery" payment creation.
 *
 * @param {object} args - The arguments for the mutation.
 * @param {string} args.orderId - The ID of the associated order.
 * @param {number} args.amount - The payment amount.
 * @param {string} [args.cartId] - The ID of the cart (optional, for authenticated users).
 * @param {string} args.storeId - The ID of the store.
 * @returns {string} The ID of the newly created payment.
 * @throws {ConvexError} If there's not enough stock for a product or if payment creation fails.
 */
export const makePayOnDeliveryPayment = mutation({
  args: {
    orderId: v.id("orders"),
    amount: v.float64(),
    cartId: v.optional(v.id("carts")),
    storeId: v.id("stores"),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();
    try {
      const payment = await ctx.db.insert("payments", {
        createdAt: now,
        updatedAt: now,
        orderId: args.orderId,
        amount: args.amount,
        currency: "GHS",
        method: "PAYMENT_ON_DELIVERY",
        status: "PENDING",
      });

      //update order status
      await ctx.db.patch(args.orderId, {
        status: "PROCESSING",
        updatedAt: now,
      });

      //delete cart items and updates product stock
      const identity = await ctx.auth.getUserIdentity();
      if (identity && args.cartId) {
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
              updatedAt: new Date().toISOString(),
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
              updatedAt: new Date().toISOString(),
            });
          })
        );
      }

      return payment;
    } catch (error) {
      if (error instanceof ConvexError) {
        throw error;
      }
      throw new ConvexError("Failed to create payment");
    }
  },
});

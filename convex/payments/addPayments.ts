import { internalMutation, mutation } from "../_generated/server";
import { v } from "convex/values";

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

export const makePayOnDeliveryPayment = mutation({
  args: {
    orderId: v.id("orders"),
    amount: v.float64(),
    cartId: v.id("carts"),
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
      const cartItems = await ctx.db
        .query("cartItems")
        .withIndex("byCart", (q) => q.eq("cartId", args.cartId))
        .collect();

      await Promise.all(
        cartItems.map(async (item) => {
          const product = await ctx.db.get(item.productId);
          if (!product) return;
          if (product.stock < item.quantity) {
            throw new Error(`Not enough stock for ${product.title}`);
          }
          await ctx.db.patch(item.productId, {
            stock: product.stock - item.quantity,
            updatedAt: new Date().toISOString(),
          });
          return await ctx.db.delete(item._id);
        })
      );

      return payment;
    } catch (err) {
      console.log(err);
      throw new Error("Failed to create payment");
    }
  },
});




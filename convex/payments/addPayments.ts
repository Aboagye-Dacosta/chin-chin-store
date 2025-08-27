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
              throw new Error(`Not enough stock for ${product.title}`);
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
              throw new Error(`Not enough stock for ${product.title}`);
            }
            await ctx.db.patch(productByStore._id, {
              quantity: productByStore.quantity - item.quantity,
              updatedAt: new Date().toISOString(),
            });

          })
        );
      }

      return payment;
    } catch{
      throw new Error("Failed to create payment");
    }
  },
});

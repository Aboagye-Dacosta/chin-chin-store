import { v } from "convex/values";
import { api, internal } from "./_generated/api";
import {
  action,
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "./_generated/server";
import { decryptSecret } from "./paymentGateway";

export const paymentSettings = query({
  handler: async (ctx) => {
    const settings = await ctx.db.query("paymentGatewaySettings").first();

    if (!settings) {
      return null;
    }

    const decryptedApiKey = await decryptSecret(
      settings.apiKey,
      `${settings.name}:${settings.environment}`
    );

    const decryptedApiSecret = await decryptSecret(
      settings.apiSecret,
      `${settings.name}:${settings.environment}`
    );

    const decryptedWebhookSecret = settings.webhookSecret
      ? await decryptSecret(
          settings.webhookSecret,
          `${settings.name}:${settings.environment}`
        )
      : undefined;

    return {
      ...settings,
      apiKey: decryptedApiKey,
      apiSecret: decryptedApiSecret,
      webhookSecret: decryptedWebhookSecret,
    };
  },
});

export const getAllPayments = query({
  handler: async (ctx) => {
    // 1. Fetch all payments
    const payments = await ctx.db.query("payments").collect();

    // 2. Map through payments and enrich them
    const enrichedPayments = await Promise.all(
      payments.map(async (payment) => {
        // 3. Get order
        const order = await ctx.db.get(payment.orderId);
        console.log("order", order);
        if (!order) return payment; // Skip if order doesn't exist

        // 4. Get related user, vendor, store
        const [user, vendor, store] = await Promise.all([
          order.userId ? ctx.db.get(order.userId) : null,
          order.vendorId ? ctx.db.get(order.vendorId) : null,
          order.storeId ? ctx.db.get(order.storeId) : null,
        ]);

        const vendorUser = vendor?.userId
          ? await ctx.db.get(vendor.userId)
          : null;

        console.log("user", user);
        console.log("vendor", vendorUser);
        console.log("store", store);

        return {
          ...payment,
          user: user?.name ?? null,
          vendor: vendorUser?.name ?? null,
          store: store?.name ?? null,
        };
      })
    );

    return enrichedPayments;
  },
});

export const addPayment = internalMutation({
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
      v.union(v.literal("MTN"), v.literal("AIRTELTIGO"), v.literal("TELECEL"))
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

export const updatePaymentStatus = internalMutation({
  args: {
    paymentId: v.id("payments"),
    status: v.union(
      v.literal("PENDING"),
      v.literal("PAID"),
      v.literal("FAILED"),
      v.literal("REFUNDED"),
      v.literal("AWAITING_CONFIRMATION")
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.paymentId, { status: args.status });
  },
});

export const getInternalPaymentById = internalQuery({
  args: {
    paymentId: v.id("payments"),
  },
  handler: async (ctx, args) => {
    const payment = await ctx.db.get(args.paymentId);
    return payment;
  },
});

export const makePayment = mutation({
  args: {
    vendorId: v.id("vendors"),
    userId: v.id("users"),
    storeId: v.id("stores"),
    amount: v.float64(),
    callback_url: v.optional(v.string()),
    trackingNumber: v.optional(v.string()),
    method: v.union(
      v.literal("MOBILE_MONEY"),
      v.literal("PAYMENT_ON_DELIVERY"),
      v.literal("CARD")
    ),
    deliveryAddressLabel: v.string(),
    deliveryNote: v.optional(v.string()),
    transactionId: v.optional(v.string()),
    transactionReference: v.optional(v.string()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();
    const order = await ctx.db.insert("orders", {
      createdAt: now,
      updatedAt: now,
      userId: args.userId,
      status: "PENDING",
      storeId: args.storeId,
      deliveryAddressLabel: args.deliveryAddressLabel,
      deliveryNote: args.deliveryNote,
      vendorId: args.vendorId,
      total: args.amount,
      trackingNumber: args.trackingNumber,
    });

    if (args.method === "PAYMENT_ON_DELIVERY") {
      try {
        await ctx.db.insert("payments", {
          orderId: order,
          amount: args.amount,
          currency: "GHS",
          method: "PAYMENT_ON_DELIVERY",
          status: "PENDING",
          createdAt: now,
          updatedAt: now,
        });

        ctx.db.patch(order, { status: "PROCESSING" });
      } catch (error) {
        ctx.db.delete(order);
        throw new Error(`Failed to create payment ${error}`);
      }
    }

    return order;
  },
});


export const updatePayment = mutation({
  args: {
    paymentId: v.id("payments"),
    status: v.union(
      v.literal("PENDING"),
      v.literal("PAID"),
      v.literal("FAILED"),
      v.literal("REFUNDED"),
      v.literal("AWAITING_CONFIRMATION")
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.paymentId, { status: args.status });
  },
});

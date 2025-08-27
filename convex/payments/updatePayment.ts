import { internalMutation, mutation } from "../_generated/server";
import { v } from "convex/values";
import { PaymentStatus } from "../schema";

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
  },
});

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
  },
});

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
      if (args.cartId) {
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
              updatedAt: now,
            });
            return await ctx.db.delete(item._id);
          })
        );
      }
      return args.paymentId;
    } catch {
      throw new Error("Failed to complete payment");
    }
  },
});

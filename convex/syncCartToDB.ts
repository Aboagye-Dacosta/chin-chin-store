import { mutation } from "../convex/_generated/server";
import { v } from "convex/values";

export const syncCartToDB = mutation({
  args: {
    storeId: v.string(),
    productId: v.id("products"),
    existingQuantity: v.number(),
    quantity: v.number(),
    cartId: v.id("carts"),
    productPrice: v.float64(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("cartItems")
      .withIndex("byCart", (q) => q.eq("cartId", args.cartId))
      .filter((q) => q.eq("productId", args.productId as string))
      .first();

    if (existing) {
      return await ctx.db.patch(existing._id, {
        quantity: existing.quantity + (args.quantity - args.existingQuantity),
        total:
          (existing.quantity + (args.quantity - args.existingQuantity)) *
          args.productPrice,
      });
    }

    return await ctx.db.insert("cartItems", {
      cartId: args.cartId,
      productId: args.productId,
      quantity: args.quantity,
      total: args.quantity * args.productPrice,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  },
});

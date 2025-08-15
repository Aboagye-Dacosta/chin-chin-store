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
      .withIndex("byCartAndProduct", (q) =>
        q.eq("cartId", args.cartId).eq("productId", args.productId)
      )
      .first();

    if (existing) {
      return await ctx.db.patch(existing._id, {
        quantity:
          args.existingQuantity + (args.quantity - args.existingQuantity),
        total:
          (args.existingQuantity + (args.quantity - args.existingQuantity)) *
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

export const syncRemovedItems = mutation({
  args: {
    removedItems: v.array(v.id("cartItems")),
  },
  handler: async (ctx, args) => {
    const hasRemovedItems = args.removedItems.some(Boolean);
    if (hasRemovedItems) {
      args.removedItems.forEach(async (item) => {
        await ctx.db.delete(item);
      });
    }
  },
});

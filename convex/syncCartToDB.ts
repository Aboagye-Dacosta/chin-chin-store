/**
 * Functions for syncing cart data to the database.
 */
import { mutation } from "../convex/_generated/server";
import { v } from "convex/values";

/**
 * Syncs a cart item to the database. If the item already exists, its quantity will be updated.
 * Otherwise, a new cart item will be inserted.
 *
 * @param {object} args - The arguments for the mutation.
 * @param {string} args.storeId - The ID of the store the cart belongs to.
 * @param {string} args.productId - The ID of the product.
 * @param {number} args.existingQuantity - The existing quantity of the product in the cart.
 * @param {number} args.quantity - The new quantity of the product.
 * @param {string} args.cartId - The ID of the cart.
 * @param {number} args.productPrice - The price of the product.
 * @returns {string} The ID of the updated or newly inserted cart item.
 */
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

/**
 * Syncs removed cart items from the database.
 *
 * @param {object} args - The arguments for the mutation.
 * @param {Array<string>} args.removedItems - An array of cart item IDs to remove.
 */
export const syncRemovedItems = mutation({
  args: {
    removedItems: v.array(v.id("cartItems")),
  },
  handler: async (ctx, args) => {
    if (args.removedItems.length > 0) {
      await Promise.all(
        args.removedItems.map(async (item) => {
          await ctx.db.delete(item);
        })
      );
    }
  },
});

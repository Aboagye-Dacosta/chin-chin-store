/**
 * Functions for managing cart items.
 */
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Retrieves the items in a cart.
 *
 * @param {object} args - The arguments for the query.
 * @param {string} [args.cartId] - The ID of the cart to retrieve the items for.
 * @returns {Array<object>} An array of cart item objects.
 */
export const getCartItems = query({
  args: {
    cartId: v.optional(v.id("carts")),
  },
  handler: async (ctx, args) => {
    if (!args.cartId) return [];
    const cartItems = await ctx.db
      .query("cartItems")
      .withIndex("byCart", (q) => q.eq("cartId", args.cartId!))
      .collect();
    return cartItems;
  },
});

/**
 * Adds an item to a cart. If the cart does not exist, it will be created.
 * If the item already exists in the cart, its quantity will be updated.
 *
 * @param {object} args - The arguments for the mutation.
 * @param {string} args.storeId - The ID of the store the cart belongs to.
 * @param {string} [args.cartId] - The ID of the cart to add the item to.
 * @param {string} args.productId - The ID of the product to add to the cart.
 * @param {number} args.quantity - The quantity of the product to add.
 * @param {number} args.productPrice - The price of the product.
 * @returns {string|null} The ID of the new or existing cart item, or null if the user is not authenticated.
 */
export const addCartItem = mutation({
  args: {
    storeId: v.id("stores"),
    cartId: v.optional(v.id("carts")),
    productId: v.id("products"),
    quantity: v.number(),
    productPrice: v.float64(),
  },
  handler: async (
    ctx,
    { storeId, cartId, productId, quantity, productPrice }
  ) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const now = new Date().toISOString();
    let cartIdToUpdate = cartId;

    if (!cartIdToUpdate) {
      const user = await ctx.db
        .query("users")
        .withIndex("byClerkId", (q) => q.eq("clerkId", identity.subject))
        .first();

      if (!user) return null;

      const existingCart = await ctx.db
        .query("carts")
        .withIndex("byUserAndStore", (q) =>
          q.eq("userId", user._id).eq("storeId", storeId)
        )
        .first();

      if (existingCart) {
        cartIdToUpdate = existingCart._id;
      } else {
        cartIdToUpdate = await ctx.db.insert("carts", {
          userId: user._id,
          storeId,
          status: "ACTIVE",
          createdAt: now,
          updatedAt: now,
        });
      }
    }

    const existingCartItem = await ctx.db
      .query("cartItems")
      .withIndex("byCartAndProduct", (q) =>
        q.eq("cartId", cartIdToUpdate).eq("productId", productId)
      )
      .first();

    if (existingCartItem) {
      const newQuantity = existingCartItem.quantity + quantity;
      return await ctx.db.patch(existingCartItem._id, {
        quantity: newQuantity,
        total: newQuantity * productPrice,
      });
    }

    return await ctx.db.insert("cartItems", {
      cartId: cartIdToUpdate,
      productId,
      quantity,
      total: quantity * productPrice,
      createdAt: now,
      updatedAt: now,
    });
  },
});

/**
 * Removes an item from a cart.
 *
 * @param {object} args - The arguments for the mutation.
 * @param {string} args.id - The ID of the cart item to remove.
 */
export const removeCartItem = mutation({
  args: {
    id: v.id("cartItems"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

/**
 * Updates the quantity of an item in a cart.
 *
 * @param {object} args - The arguments for the mutation.
 * @param {string} args.id - The ID of the cart item to update.
 * @param {number} args.quantity - The new quantity of the item.
 * @param {number} args.productPrice - The price of the product.
 */
export const updateCartItem = mutation({
  args: {
    id: v.id("cartItems"),
    quantity: v.number(),
    productPrice: v.float64(),
  },
  handler: async (ctx, { id, quantity, productPrice }) => {
    await ctx.db.patch(id, {
      quantity,
      total: quantity * productPrice,
    });
  },
});

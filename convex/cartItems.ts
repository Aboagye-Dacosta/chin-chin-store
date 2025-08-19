import { internalMutation, mutation, query } from "./_generated/server";
import { v } from "convex/values";

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
    let newCartId = cartId;
    if (!cartId) {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) return null;
      const clerkId = identity.subject;
      const user = await ctx.db
        .query("users")
        .withIndex("byClerkId", (q) => q.eq("clerkId", clerkId))
        .first();

      if (!user) return null;

      const cart = await ctx.db
        .query("carts")
        .withIndex("byUser", (q) => q.eq("userId", user._id))
        .filter((q) => q.eq("storeId", storeId as string))
        .first();

      if (!cart) {
        newCartId = await ctx.db.insert("carts", {
          userId: user._id,
          storeId,
          status: "ACTIVE",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });

        return await ctx.db.insert("cartItems", {
          cartId: newCartId,
          productId,
          quantity,
          total: quantity * productPrice,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    }

    const existing = await ctx.db
      .query("cartItems")
      .withIndex("byCartAndProduct", (q) =>
        q.eq("cartId", newCartId!).eq("productId", productId)
      )
      .first();

    if (existing) {
      return await ctx.db.patch(existing._id, {
        quantity: existing.quantity + quantity,
        total: (existing.quantity + quantity) * productPrice,
      });
    }

    return await ctx.db.insert("cartItems", {
      cartId: newCartId!,
      productId,
      quantity,
      total: quantity * productPrice,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  },
});

export const removeCartItem = mutation({
  args: {
    id: v.id("cartItems"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

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

//internal actions
export const deleteCartItemsAndUpdateStock = internalMutation({
  args: {
    cartId: v.id("carts"),
  },
  handler: async (ctx, args) => {
    const cartItems = await ctx.db
      .query("cartItems")
      .withIndex("byCart", (q) => q.eq("cartId", args.cartId))
      .collect();

    await Promise.all(
      cartItems.map(async (item) => {
        const product = await ctx.db.get(item.productId);
        if (!product) return;
        if(product.stock < item.quantity){
          throw new Error(`Not enough stock for ${product.title}`);
        }
        await ctx.db.patch(item.productId, {
          stock: product.stock - item.quantity,
          updatedAt: new Date().toISOString(),
        });
        return await ctx.db.delete(item._id);
      })
    );
  },
});



/**
 * Functions for managing products in stores.
 */
import {  ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Retrieves products associated with a store, based on the user's role.
 *
 * @returns {Array<object>|null} An array of enriched product-by-store objects, or null if not authenticated.
 * @throws {ConvexError} If the user is not authenticated.
 */
export const productsByStore = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Not authenticated");
    const clerkId = identity.subject;
    const user = await ctx.db
      .query("users")
      .withIndex("byClerkId", (q) => q.eq("clerkId", clerkId))
      .first();
    if (!user) return null; // Should not happen if authenticated

    if (user.role === "VENDOR") {
      const vendor = await ctx.db
        .query("vendors")
        .withIndex("byUser", (q) => q.eq("userId", user._id))
        .first();

      if (!vendor) return null; // Vendor not found for the user

      const productsByStore = await ctx.db
        .query("productsByStore")
        .withIndex("byStore", (q) => q.eq("storeId", vendor.storeId))
        .collect();

      const enrichedProducts = await Promise.all(
        productsByStore.map(async (product) => {
          const store = await ctx.db.get(product.storeId);
          const productData = await ctx.db.get(product.productId);
          const category = productData ? await ctx.db.get(productData.categoryId) : null;
          let image;
          if (productData?.image) {
            const result = await ctx.db.get(productData.image);
            if (result) {
              image = await ctx.storage.getUrl(result.storageId);
            }
          }

          let model;
          if (productData?.model) {
            const result = await ctx.db.get(productData.model);
            if (result) {
              model = await ctx.storage.getUrl(result.storageId);
            }
          }
          return {
            ...product,
            store,
            product: {
              ...productData,
              model,
              image,
            },
            category,
          };
        })
      );
      return enrichedProducts;
    }

    if (user.role === "SUPER_ADMIN") {
      const products = await ctx.db.query("productsByStore").collect();
      const enrichedProducts = await Promise.all(
        products.map(async (product) => {
          const store = await ctx.db.get(product.storeId);
          const productData = await ctx.db.get(product.productId);
          const category = productData ? await ctx.db.get(productData.categoryId) : null;
          let image;
          if (productData?.image) {
            const result = await ctx.db.get(productData.image);
            if (result) {
              image = await ctx.storage.getUrl(result.storageId);
            }
          }

          let model;
          if (productData?.model) {
            const result = await ctx.db.get(productData.model);
            if (result) {
              model = await ctx.storage.getUrl(result.storageId);
            }
          }
          return {
            ...product,
            store,
            product: {
              ...productData,
              model,
              image,
            },
            category,
          };
        })
      );
      return enrichedProducts;
    }

    return [];
  },
});

/**
 * Adds a product to a store.
 *
 * @param {object} args - The arguments for the mutation.
 * @param {string} args.productId - The ID of the product to add.
 * @param {string} args.storeId - The ID of the store to add the product to.
 * @param {number} args.quantity - The quantity of the product.
 * @returns {string} The ID of the new product-by-store entry.
 * @throws {ConvexError} If the product already exists in the store.
 */
export const addProductToStore = mutation({
  args: {
    productId: v.id("products"),
    storeId: v.id("stores"),
    quantity: v.number(),
  },
  handler: async (ctx, args) => {
    const existingProduct = await ctx.db
      .query("productsByStore")
      .withIndex("byStoreAndProduct", (q) =>
        q.eq("storeId", args.storeId).eq("productId", args.productId)
      )
      .first();

    if (existingProduct) throw new ConvexError<string>("Product already exists in this store");

    const now = new Date().toISOString();
    const product = await ctx.db.insert("productsByStore", {
      productId: args.productId,
      storeId: args.storeId,
      quantity: args.quantity,
      createdAt: now,
      updatedAt: now,
    });

    return product;
  },
});

/**
 * Removes a product from a store.
 *
 * @param {object} args - The arguments for the mutation.
 * @param {string} args.productId - The ID of the product to remove.
 * @param {string} args.storeId - The ID of the store to remove the product from.
 * @throws {ConvexError} If the product exists in an active cart or order for that store.
 */
export const removeProductFromStore = mutation({
  args: {
    productId: v.id("products"),
    storeId: v.id("stores"),
  },
  handler: async (ctx, args) => {
    //check cart items
    const productInAnyCart = await ctx.db.query("cartItems").withIndex("byProduct", (q) => q.eq("productId", args.productId)).collect()
    for (const cartItem of productInAnyCart) {
      const cart = await ctx.db.get(cartItem?.cartId)
      if (cart?.storeId === args.storeId) throw new ConvexError("Product exists in a cart for this store")
    }

    //check order items
    const productInAnyOrder = await ctx.db.query("orderItems").withIndex("byProduct", (q) => q.eq("productId", args.productId)).collect()
    for (const orderItem of productInAnyOrder) {
      const order = await ctx.db.get(orderItem?.orderId)
      if (order?.storeId === args.storeId) throw new ConvexError("Product exists in an order for this store")
    }

    const productByStore = await ctx.db
      .query("productsByStore")
      .withIndex("byStoreAndProduct", (q) =>
        q.eq("storeId", args.storeId).eq("productId", args.productId)
      )
      .first();
    if (!productByStore) throw new ConvexError("Product not found in this store");
    
    await ctx.db.delete(productByStore._id);
  },
});

/**
 * Updates the quantity of a product in a store.
 *
 * @param {object} args - The arguments for the mutation.
 * @param {string} args.productId - The ID of the product to update.
 * @param {string} args.storeId - The ID of the store the product belongs to.
 * @param {number} args.quantity - The new quantity of the product.
 * @returns {string} The ID of the updated product-by-store entry.
 * @throws {ConvexError} If the product is not found in the store.
 */
export const updateProductQuantity = mutation({
  args: {
    productId: v.id("products"),
    storeId: v.id("stores"),
    quantity: v.number(),
  },
  handler: async (ctx, args) => {
    const productByStore = await ctx.db
      .query("productsByStore")
      .withIndex("byStoreAndProduct", (q) =>
        q.eq("storeId", args.storeId).eq("productId", args.productId)
      )
      .first();
    if (!productByStore) throw new ConvexError("Product not found in this store");
    
    const product = await ctx.db.patch(productByStore._id, {
      quantity: args.quantity,
      updatedAt: new Date().toISOString(),
    });
    return product;
  },
});

import { queryGeneric } from "convex/server";
import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const productsByStore = queryGeneric({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const clerkId = identity.subject;
    const user = await ctx.db
      .query("users")
      .withIndex("byClerkId", (q) => q.eq("clerkId", clerkId))
      .first();
    if (!user) return null;

    if (user.role === "VENDOR") {
      const vendor = await ctx.db
        .query("vendors")
        .withIndex("byUser", (q) => q.eq("userId", user._id))
        .first();

      if (!vendor) return null;

      const productsByStore = await ctx.db
        .query("productsByStore")
        .withIndex("byStore", (q) => q.eq("storeId", vendor.storeId))
        .collect();

      const enrichedProducts = await Promise.all(
        productsByStore.map(async (product) => {
          const store = await ctx.db.get(product.storeId);
          const productData = await ctx.db.get(product.productId);
          const category = await ctx.db.get(productData.categoryId);
          return {
            ...product,
            store,
            product: productData,
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
          const category = await ctx.db.get(productData.categoryId);
          return {
            ...product,
            store,
            product: productData,
            category,
          };
        })
      );
      return enrichedProducts;
    }

    return [];
  },
});

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

    if (existingProduct) throw new Error("Product already exists");

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

export const removeProductFromStore = mutation({
  args: {
    productId: v.id("products"),
    storeId: v.id("stores"),
  },
  handler: async (ctx, args) => {
    const productByStore = await ctx.db
      .query("productsByStore")
      .withIndex("byStoreAndProduct", (q) =>
        q.eq("storeId", args.storeId).eq("productId", args.productId)
      )
      .first();
    if (!productByStore) throw new Error("Product not found");
    const product = await ctx.db.delete(productByStore._id);
    return product;
  },
});

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
    if (!productByStore) throw new Error("Product not found");
    const product = await ctx.db.patch(productByStore._id, {
      quantity: args.quantity,
      updatedAt: new Date().toISOString(),
    });
    return product;
  },
});

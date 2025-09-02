
/**
 * Functions for managing stores.
 */
import { v, ConvexError } from "convex/values";
import { query, mutation } from "./_generated/server";

/**
 * Retrieves all stores, enriching them with location, vendors, and product count.
 * Accessible only by SUPER_ADMIN role.
 *
 * @returns {Array<object>} An array of enriched store objects.
 * @throws {ConvexError} If the user is not authenticated or not authorized.
 */
export const getStores = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("You are not Authenticated");
    const user = await ctx.db
      .query("users")
      .withIndex("byClerkId", (q) => q.eq("clerkId", identity.subject))
      .first();
    if (!user) throw new ConvexError("User not found");

    if (user.role !== "SUPER_ADMIN")
      throw new ConvexError("You are not authorized");

    const stores = await ctx.db.query("stores").collect();
    const enrichedStores = await Promise.all(
      stores.map(async (store) => {
        const location = await ctx.db.get(store.locationId);
        const vendors = await ctx.db
          .query("vendors")
          .withIndex("byStore", (q) => q.eq("storeId", store._id))
          .collect();
        const productsByStore = await ctx.db
          .query("productsByStore")
          .withIndex("byStore", (q) => q.eq("storeId", store._id))
          .collect();
        const enrichedVendors = await Promise.all(
          vendors.map(async (vendor) => {
            const user = await ctx.db.get(vendor.userId);
            return {
              name: user?.name,
            };
          })
        );
        return {
          ...store,
          location,
          vendors: enrichedVendors,
          productCount:
            productsByStore?.reduce(
              (acc, product) => acc + product.quantity,
              0
            ) ?? 0,
        };
      })
    );
    return enrichedStores;
  },
});

/**
 * Retrieves all stores, enriching them with location, vendors, and product count.
 * This query is accessible by all users.
 *
 * @returns {Array<object>} An array of enriched store objects.
 */
export const getUserStores = query({
  handler: async (ctx) => {
    const stores = await ctx.db.query("stores").collect();
    const enrichedStores = await Promise.all(
      stores.map(async (store) => {
        const location = await ctx.db.get(store.locationId);
        const vendors = await ctx.db
          .query("vendors")
          .withIndex("byStore", (q) => q.eq("storeId", store._id))
          .collect();
        const productsByStore = await ctx.db
          .query("productsByStore")
          .withIndex("byStore", (q) => q.eq("storeId", store._id))
          .collect();
        const enrichedVendors = await Promise.all(
          vendors.map(async (vendor) => {
            const user = await ctx.db.get(vendor.userId);
            return {
              name: user?.name,
            };
          })
        );
        return {
          ...store,
          location,
          vendors: enrichedVendors,
          productCount:
            productsByStore?.reduce(
              (acc, product) => acc + product.quantity,
              0
            ) ?? 0,
        };
      })
    );
    return enrichedStores;
  },
});

/**
 * Adds a new store.
 *
 * @param {object} args - The arguments for the mutation.
 * @param {string} args.name - The name of the store.
 * @param {string} args.locationId - The ID of the location for the store.
 * @param {number} args.deliveryCharge - The delivery charge for the store.
 * @returns {string} The ID of the newly created store.
 * @throws {ConvexError} If a store with the same name already exists.
 */
export const addStore = mutation({
  args: {
    name: v.string(),
    locationId: v.id("locations"),
    deliveryCharge: v.float64(),
  },
  handler: async (ctx, args) => {
    const existingStore = await ctx.db
      .query("stores")
      .filter((q) => q.eq("name", args.name))
      .first();
    if (existingStore) {
      throw new ConvexError("Store already exists.");
    }
    const now = new Date().toISOString();
    return await ctx.db.insert("stores", {
        name: args.name,
        locationId: args.locationId,
        deliveryCharge: args.deliveryCharge,
        createdAt: now,
        updatedAt: now,
    });
  },
});

/**
 * Deletes a store.
 *
 * @param {object} args - The arguments for the mutation.
 * @param {string} args.id - The ID of the store to delete.
 * @throws {ConvexError} If the store has associated products, orders, carts, or vendors.
 */
export const deleteStore = mutation({
  args: {
    id: v.id("stores"),
  },
  handler: async (ctx, args) => {
    //check productsByStore 
    const productByStore = await ctx.db.query("productsByStore").withIndex("byStore", (q) => q.eq("storeId", args.id)).collect();
    if(productByStore?.length > 0){
      throw new ConvexError("Store has products");
    }
    //check orders
    const orders = await ctx.db.query("orders").withIndex("byStore", (q) => q.eq("storeId", args.id)).collect();
    if(orders?.length > 0){
      throw new ConvexError("Store has orders");
    }
    //check carts
    const carts = await ctx.db.query("carts").withIndex("byStore", (q) => q.eq("storeId", args.id)).collect();
    if(carts?.length > 0){
      throw new ConvexError("Store has carts");
    }
    //check vendors
    const vendors = await ctx.db.query("vendors").withIndex("byStore", (q) => q.eq("storeId", args.id)).collect();
    if(vendors?.length > 0){
      throw new ConvexError("Store has vendors");
    }
    
    await ctx.db.delete(args.id);
  },
});


/**
 * Updates an existing store.
 *
 * @param {object} args - The arguments for the mutation.
 * @param {string} args.id - The ID of the store to update.
 * @param {string} args.name - The new name of the store.
 * @param {string} args.locationId - The new ID of the location for the store.
 * @param {number} args.deliveryCharge - The new delivery charge for the store.
 */
export const updateStore = mutation({
  args: {
    id: v.id("stores"),
    name: v.string(),
    locationId: v.id("locations"),
    deliveryCharge: v.float64(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      name: args.name,
      locationId: args.locationId,
      deliveryCharge: args.deliveryCharge,
      updatedAt: new Date().toISOString(),
    });
  },
})


// export const updateStore = mutation({
//   args: {
//     id: v.id("stores"),
//     name: v.string(),
//     locationId: v.id("locations"),
//     deliveryCharge: v.float64(),
//   },
//   handler: async (ctx, args) => {
//     await ctx.db.patch(args.id, {
//       name: args.name,
//       locationId: args.locationId,
//       deliveryCharge: args.deliveryCharge,
//       updatedAt: new Date().toISOString(),
//     });
//   },
// })

/**
 * Functions for retrieving all payments.
 */
import { query } from "../_generated/server";

/**
 * Retrieves all payments and enriches them with related order, user, vendor, and store details.
 *
 * @returns {Array<object>} An array of enriched payment objects.
 */
export const getAllPayments = query({
  handler: async (ctx) => {
    // 1. Fetch all payments
    const payments = await ctx.db.query("payments").collect();

    // 2. Map through payments and enrich them
    const enrichedPayments = await Promise.all(
      payments.map(async (payment) => {
        // 3. Get order
        const order = await ctx.db.get(payment.orderId);
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

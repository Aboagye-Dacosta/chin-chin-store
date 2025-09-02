/**
 * Functions for retrieving payments by ID.
 */
import { internalQuery } from "../_generated/server";
import { v } from "convex/values";

/**
 * Retrieves a payment by its ID (internal query).
 *
 * @param {object} args - The arguments for the internal query.
 * @param {string} args.paymentId - The ID of the payment to retrieve.
 * @returns {object|null} The payment object, or null if not found.
 */
export const getInternalPaymentById = internalQuery({
  args: {
    paymentId: v.id("payments"),
  },
  handler: async (ctx, args) => {
    const payment = await ctx.db.get(args.paymentId);
    return payment;
  },
});

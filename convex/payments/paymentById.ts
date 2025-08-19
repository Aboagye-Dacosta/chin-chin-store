import { internalQuery } from "../_generated/server";
import { v } from "convex/values";

export const getInternalPaymentById = internalQuery({
  args: {   
    paymentId: v.id("payments"),
  },
  handler: async (ctx, args) => {
    const payment = await ctx.db.get(args.paymentId);
    return payment;
  },
});

import { v } from "convex/values";
import { query } from "./_generated/server";

export const paymentSettings = query({
  args: {
    storeId: v.string(),
  },
  handler: async (ctx, args) => {
    const { storeId } = args;
    const store = await ctx.db
      .query("paymentGatewaySettings")
      .filter((q) => q.eq("storeId", storeId))
      .first();
    return store;
  },
});

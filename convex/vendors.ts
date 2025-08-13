import { query } from "./_generated/server";
import { v } from "convex/values";

export const getVendors = query({
  args: {
    storeId: v.string(),
  },
  handler: async (ctx, args) => {
    const vendors = await ctx.db
      .query("users")
      .filter((q) => q.eq("role", "VENDOR"))
      .collect();
    return vendors;
  },
});

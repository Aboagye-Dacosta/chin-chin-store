/**
 * Functions for querying analytics data.
 */
import { query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Retrieves dashboard analytics data, including total revenue, new customers, total orders,
 * growth rate, and trends for each metric.
 *
 * @param {object} args - The arguments for the query.
 * @param {string} [args.storeId] - The ID of the store to filter by.
 * @returns {object} An object containing the dashboard analytics data.
 */
export const getDashboardAnalytics = query({
  args: {
    storeId: v.optional(v.id("stores")),
  },
  handler: async (ctx, { storeId }) => {
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);
    const fourteenDaysAgo = new Date(today);
    fourteenDaysAgo.setDate(today.getDate() - 14);

    const last14DaysSales = await ctx.db
      .query("salesAnalytics")
      .filter((q) =>
        q.and(
          storeId
            ? q.eq(q.field("storeId"), storeId)
            : q.neq(q.field("storeId"), null),
          q.gte(q.field("date"), fourteenDaysAgo.toISOString().split("T")[0])
        )
      )
      .collect();

    const last14DaysUsers = await ctx.db
      .query("userAnalytics")
      .filter((q) =>
        q.gte(q.field("date"), fourteenDaysAgo.toISOString().split("T")[0])
      )
      .collect();

    const currentWeekSales = last14DaysSales.filter(
      (s) => new Date(s.date) >= sevenDaysAgo
    );
    const previousWeekSales = last14DaysSales.filter(
      (s) => new Date(s.date) < sevenDaysAgo
    );

    const currentWeekUsers = last14DaysUsers.filter(
      (u) => new Date(u.date) >= sevenDaysAgo
    );
    const previousWeekUsers = last14DaysUsers.filter(
      (u) => new Date(u.date) < sevenDaysAgo
    );

    const totalRevenueCurrentWeek = currentWeekSales.reduce(
      (acc, curr) => acc + curr.totalRevenue,
      0
    );
    const totalRevenuePreviousWeek = previousWeekSales.reduce(
      (acc, curr) => acc + curr.totalRevenue,
      0
    );

    const totalOrdersCurrentWeek = currentWeekSales.reduce(
      (acc, curr) => acc + curr.totalOrders,
      0
    );
    const totalOrdersPreviousWeek = previousWeekSales.reduce(
      (acc, curr) => acc + curr.totalOrders,
      0
    );

    const newCustomersCurrentWeek = currentWeekUsers.reduce(
      (acc, curr) => acc + curr.newCustomers,
      0
    );
    const newCustomersPreviousWeek = previousWeekUsers.reduce(
      (acc, curr) => acc + curr.newCustomers,
      0
    );

    const revenueTrend =
      totalRevenueCurrentWeek >= totalRevenuePreviousWeek ? "up" : "down";
    const customerTrend =
      newCustomersCurrentWeek >= newCustomersPreviousWeek ? "up" : "down";
    const orderTrend =
      totalOrdersCurrentWeek >= totalOrdersPreviousWeek ? "up" : "down";

    const calculatePercentageChange = (current: number, previous: number) => {
      if (previous > 0) {
        return ((current - previous) / previous) * 100;
      }
      return current > 0 ? 100 : 0;
    };

    const revenuePercentageChange = calculatePercentageChange(
      totalRevenueCurrentWeek,
      totalRevenuePreviousWeek
    );
    const customerPercentageChange = calculatePercentageChange(
      newCustomersCurrentWeek,
      newCustomersPreviousWeek
    );
    const orderPercentageChange = calculatePercentageChange(
      totalOrdersCurrentWeek,
      totalOrdersPreviousWeek
    );

    const totalRevenue = await ctx.db.query("salesAnalytics").collect();
    const newCustomers = await ctx.db.query("userAnalytics").collect();
    const totalOrders = await ctx.db.query("salesAnalytics").collect();

    const totalRevenueAmount = totalRevenue.reduce(
      (acc, curr) => acc + curr.totalRevenue,
      0
    );
    const totalNewCustomers = newCustomers.reduce(
      (acc, curr) => acc + curr.newCustomers,
      0
    );
    const totalOrdersCount = totalOrders.reduce(
      (acc, curr) => acc + curr.totalOrders,
      0
    );

    const growthRate = calculatePercentageChange(
      totalRevenueCurrentWeek,
      totalRevenuePreviousWeek
    );

    return {
      totalRevenue: totalRevenueAmount,
      newCustomers: totalNewCustomers,
      totalOrders: totalOrdersCount,
      growthRate: growthRate,
      revenueTrend: revenueTrend,
      customerTrend: customerTrend,
      accountTrend: orderTrend, // Using orderTrend for accountTrend
      growthTrend: growthRate >= 0 ? "up" : "down",
      revenuePercentageChange,
      customerPercentageChange,
      orderPercentageChange,
    };
  },
});

/**
 * Retrieves sales analytics data for a given time range.
 *
 * @param {object} args - The arguments for the query.
 * @param {string} [args.storeId] - The ID of the store to filter by.
 * @param {string} args.timeRange - The time range to filter by (e.g., "7d", "30d", "90d").
 * @returns {Array<object>} An array of sales data objects, each containing a date and the total sales for that date.
 */
export const getSalesAnalytics = query({
  args: {
    storeId: v.optional(v.id("stores")),
    timeRange: v.union(v.literal("7d"), v.literal("30d"), v.literal("90d")),
  },
  handler: async (ctx, { storeId, timeRange }) => {
    const today = new Date();
    let daysToSubtract = 90;
    if (timeRange === "30d") {
      daysToSubtract = 30;
    } else if (timeRange === "7d") {
      daysToSubtract = 7;
    }
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - daysToSubtract);

    const sales = await ctx.db
      .query("salesAnalytics")
      .filter((q) =>
        q.and(
          storeId
            ? q.eq(q.field("storeId"), storeId)
            : q.neq(q.field("storeId"), null),
          q.gte(q.field("date"), startDate.toISOString().split("T")[0])
        )
      )
      .collect();

    return sales.map((s) => ({ date: s.date, sales: s.totalRevenue }));
  },
});

/**
 * Retrieves the performance data for all stores.
 *
 * @returns {Array<object>} An array of store performance data objects, each containing store details,
 * location, total revenue, and total orders.
 */
export const getStorePerformance = query({
  handler: async (ctx) => {
    const stores = await ctx.db.query("stores").collect();

    const storePerformance = await Promise.all(
      stores.map(async (store) => {
        const storeAnalytics = await ctx.db
          .query("storeAnalytics")
          .withIndex("byStore", (q) => q.eq("storeId", store._id))
          .first();

        const location = await ctx.db.get(store.locationId);

        return {
          ...store,
          location: location?.name ?? "Unknown Location",
          totalRevenue: storeAnalytics?.totalRevenue ?? 0,
          totalOrders: storeAnalytics?.totalOrders ?? 0,
        };
      })
    );

    return storePerformance;
  },
});

/**
 * Retrieves the top-selling products.
 *
 * @returns {Array<object>} An array of the top-selling product data objects, each containing product details,
 * category, total sold, and total revenue.
 */
export const getTopSellingProducts = query({
  handler: async (ctx) => {
    const productAnalytics = await ctx.db
      .query("productAnalytics")
      .order("desc")
      .collect();

    const topSellingProducts = await Promise.all(
      productAnalytics.map(async (pa) => {
        const product = await ctx.db.get(pa.productId);
        const category = product ? await ctx.db.get(product.categoryId) : null;
        return {
          ...product,
          category: category?.name,
          totalSold: pa.totalSold,
          totalRevenue: pa.totalRevenue,
        };
      })
    );

    return topSellingProducts
      .sort((a, b) => b.totalSold - a.totalSold)
      .slice(0, 10);
  },
});

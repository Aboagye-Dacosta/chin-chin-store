"use client";

import { AnalyticsDataTable } from "@/components/analytics-data-table";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { columns, TopSellingProduct } from "./top-selling-products-columns";
import { Skeleton } from "./ui/skeleton";

export function TopSellingProductsTable() {
  const data = useQuery(api.analytics.getTopSellingProducts);

  if (!data) {
    return <Skeleton className="h-96" />;
  }

  const rows: TopSellingProduct[] = data.map((d) => ({
    _id: d._id ?? "",
    title: d.title ?? "",
    category: d.category ?? "",
    totalSold: d.totalSold,
    totalRevenue: d.totalRevenue,
  }));

  return <AnalyticsDataTable columns={columns} data={rows} />;
}

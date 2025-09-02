"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { AnalyticsDataTable } from "@/components/analytics-data-table";
import { columns } from "./store-performance-columns";
import { Skeleton } from "./ui/skeleton";

export function StorePerformanceTable() {
  const data = useQuery(api.analytics.getStorePerformance);

  if (!data) {
    return <Skeleton className="h-96" />;
  }

  return <AnalyticsDataTable columns={columns} data={data} />;
}

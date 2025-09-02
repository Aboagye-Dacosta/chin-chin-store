"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Skeleton } from "./ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { useAppThemeStore } from "@/store/use-app-theme";
import { generateColorVariants } from "@/lib/generate-color-variants";

export function StorePerformanceChart() {
  const data = useQuery(api.analytics.getStorePerformance);
  const { appColor } = useAppThemeStore();
  if (!data) {
    return <Skeleton className="h-96" />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Store Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data}>
            <CartesianGrid vertical={false} opacity={0.05} />
            <XAxis dataKey="name" />
            <Tooltip cursor={{ fill: "transparent" }} />
            <Legend />
            <Bar dataKey="totalRevenue" fill={appColor} name="Total Revenue" />
            <Bar
              dataKey="totalOrders"
              fill={generateColorVariants(appColor).lighter}
              name="Total Orders"
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

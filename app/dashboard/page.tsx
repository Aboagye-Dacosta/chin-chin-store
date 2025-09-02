"use client";
import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { Protected } from "@/components/protected";
import { SectionCards } from "@/components/section-cards";
import { StorePerformanceChart } from "@/components/store-performance-chart";
import { TopSellingProductsTable } from "@/components/top-selling-products-table";

export default function AdminDashboard() {
  return (
    <Protected>
      <div className="flex flex-col gap-8 py-8 px-4 md:p-6 lg:px-8">
        <SectionCards />
        <ChartAreaInteractive />
        <div>
          <StorePerformanceChart />
        </div>
        <div className="flex flex-col gap-4">
          <h2 className="text-2xl font-bold tracking-tight">
            Top Selling Products
          </h2>
          <TopSellingProductsTable />
        </div>
      </div>
    </Protected>
  );
}

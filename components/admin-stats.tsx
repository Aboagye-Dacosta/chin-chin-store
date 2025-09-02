"use client";

import { SectionCards } from "@/components/section-cards";
import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { Suspense } from "react";
import { StorePerformanceTable } from "./store-performance-table";
import { TopSellingProductsTable } from "./top-selling-products-table";

export function AdminStats() {
  return (
    <Suspense fallback={null}>
      <div className="flex flex-col gap-8 py-8 px-4 lg:px-6">
        <SectionCards />
        <ChartAreaInteractive />
        <div >
          <h2 className="text-2xl font-bold tracking-tight">
            Store Performance
          </h2>
          <StorePerformanceTable />
        </div>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Top Selling Products
          </h2>
          <TopSellingProductsTable />
        </div>
      </div>
    </Suspense>
  );
}

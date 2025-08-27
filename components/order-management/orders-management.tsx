"use client"
import { Flex } from "@/components/ui/flex";
import { Card, CardContent } from "@/components/ui/card";
import { CardHeaderFilters } from "../card-header-with-filters";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { DataTable } from "../DataTable";
import { OrderColumns } from "./orders-columns";

export function OrdersManagement() {
  const [filters, setFilters] = useState<Record<string, string>>({});
  const orders = useQuery(api.orders.getAdminAndVendorsOrders);
  return (
    <Flex direction="col" gap="lg" className="w-full">
      <h1 className="text-3xl font-bold">Orders Management</h1>

      <Card className={cn("w-full")}>
        <CardHeaderFilters
          title="Orders"
          className="w-full"
          filters={[]}
          onFilterChange={(filters) => {}}
          initialValues={filters}
          selectedIds={[]}
          groupActions={[]}
        />
        <CardContent>
          <DataTable
            data={orders ?? []}
            columns={OrderColumns}
            filterBy={filters}
          />
        </CardContent>
      </Card>
    </Flex>
  );
}

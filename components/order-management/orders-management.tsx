"use client";
import { Card, CardContent } from "@/components/ui/card";
import { Flex } from "@/components/ui/flex";
import { ROLES } from "@/constants/roles";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";
import { OrderWithUserAndStore } from "@/types/convex-types";
import { useQuery } from "convex/react";
import { useState } from "react";
import { CardHeaderFilters } from "../card-header-with-filters";
import { DataTable } from "../DataTable";
import { OrderColumns } from "./orders-columns";
import { ORDER_STATUSES } from "@/constants/order-statuses";

export function OrdersManagement() {
  const [filters, setFilters] = useState<Record<string, string>>({});
  const orders = useQuery(api.orders.getAdminAndVendorsOrders);
  const currentUser = useQuery(api.users.getCurrentUser);
  const stores = useQuery(api.stores.getUserStores);
  const vendors = useQuery(api.vendors.getAllVendors);

  return (
    <Flex direction="col" gap="lg" className="w-full p-7">
      <h1 className="text-3xl font-bold">Orders Management</h1>

      <Card className={cn("w-full")}>
        {currentUser?.role === ROLES.ADMIN && (
          <CardHeaderFilters
            title="Orders"
            className="w-full"
            filters={[
              {
                key: "storeId",
                label: "Store",
                options:
                  stores?.map((store) => ({
                    label: store.name,
                    value: store._id,
                  })) ?? [],
              },
              {
                key: "vendorId",
                label: "Vendor",
                options:
                  vendors?.map((vendor) => ({
                    label: vendor.user?.name ?? "",
                    value: vendor._id,
                  })) ?? [],
              },
              {
                key: "status",
                label: "status",
                options: ORDER_STATUSES.map((status) => ({
                  label: status,
                  value: status,
                })),
              },
            ]}
            onFilterChange={(filters) => setFilters(filters)}
            initialValues={filters}
            selectedIds={[]}
            groupActions={[]}
          />
        )}
        <CardContent>
          <DataTable
            data={(orders ?? []).map((order) => ({
              ...(order as OrderWithUserAndStore),
              user: (order as OrderWithUserAndStore).user ?? null,
              vendor: (order as OrderWithUserAndStore).vendor ?? null,
              store: (order as OrderWithUserAndStore).store ?? null,
            }))}
            columns={OrderColumns}
            filterBy={filters}
          />
        </CardContent>
      </Card>
    </Flex>
  );
}

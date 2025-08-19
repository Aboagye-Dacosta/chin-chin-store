"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Flex } from "../ui/flex";
import { DataTable } from "../DataTable";
import { PaymentColumns } from "./payment-table-column";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { CardHeaderFilters } from "../card-header-with-filters";
import { useState } from "react";

export function PaymentManagement() {
  const [filters, setFilters] = useState<Record<string, string>>({
    store: "",
    vendor: "",
  });
  const payments = useQuery(api.payments.allPayments.getAllPayments);
  const paymentSetting = useQuery(api.payments.paymentSettings.paymentSettings);
  const stores = useQuery(api.stores.getStores);
  const vendors = useQuery(api.users.getUserByRole, { role: "VENDOR" });

  console.log(paymentSetting);

  console.log("i am logging");

  return (
    <Flex direction="col" gap="lg" className="w-full">
      <Flex direction="row" justify="between" align="center" className="w-full">
        <Flex direction="col" gap="xl" className="w-full">
          <h1 className="text-3xl font-bold">Payment Management</h1>
          <Card className="w-full h-full">
            <CardHeaderFilters
              filters={[
                {
                  key: "store",
                  label: "Store",
                  options:
                    stores?.map((store) => ({
                      value: store.name,
                      label: store.name,
                    })) ?? [],
                },
                {
                  key: "vendor",
                  label: "Vendor",
                  options:
                    vendors?.map((vendor) => ({
                      value: vendor.name,
                      label: vendor.name,
                    })) ?? [],
                },
                {
                  key: "status",
                  label: "Status",
                  options: [
                    { value: "PENDING", label: "Pending" },
                    { value: "PAID", label: "Paid" },
                    { value: "FAILED", label: "Failed" },
                    { value: "REFUNDED", label: "Refunded" },
                    {
                      value: "AWAITING_CONFIRMATION",
                      label: "Awaiting Confirmation",
                    },
                  ],
                },
              ]}
              onFilterChange={(filters) => setFilters(filters)}
              initialValues={{}}
            />
            <CardContent>
              <DataTable
                showCheckboxes={true}
                data={payments ?? []}
                columns={PaymentColumns}
                filterBy={filters}
              />
            </CardContent>
          </Card>
        </Flex>
      </Flex>
    </Flex>
  );
}

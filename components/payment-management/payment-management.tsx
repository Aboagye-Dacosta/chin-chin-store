"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Flex } from "../ui/flex";
import { DataTable } from "../DataTable";
import { PaymentColumns } from "./payment-table-column";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { PaymentGatewayForm } from "./payment-gate-way-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { CardHeaderFilters } from "../card-header-with-filters";
import { useState } from "react";

export function PaymentManagement() {
  const [filters, setFilters] = useState<Record<string, string>>({
    store: "",
    vendor: "",
  });
  const payments = useQuery(api.payments.getAllPayments);
  const paymentSetting = useQuery(api.payments.paymentSettings);
  const stores = useQuery(api.stores.getStores);
  const vendors = useQuery(api.users.getUserByRole, { role: "VENDOR" });

  console.log("i am logging");

  return (
    <Flex direction="col" gap="lg" className="w-full">
      <Flex direction="row" justify="between" align="center" className="w-full">
        <Tabs defaultValue="payments" className="w-full">
          <TabsList>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="payment-settings">Payment Settings</TabsTrigger>
          </TabsList>
          <TabsContent value="payments" className="w-full">
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
                        { value: "AWAITING_CONFIRMATION", label: "Awaiting Confirmation" },
                      ],
                    }
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
          </TabsContent>
          <TabsContent value="payment-settings" className="w-full">
            <Flex direction="col" gap="xl" className="w-full">
              <h1 className="text-3xl font-bold">Payment Settings</h1>
              <Card className="w-full h-full">
                <CardHeader className="sr-only">
                  <CardTitle className="text-2xl font-bold">
                    Payment Settings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <PaymentGatewayForm
                    initialData={{
                      name: paymentSetting?.name,
                      apiKey: paymentSetting?.apiKey,
                      apiSecret: paymentSetting?.apiSecret,
                      environment: paymentSetting?.environment,
                      supportedMethods: paymentSetting?.supportedMethods,
                      supportedNetworks: paymentSetting?.supportedNetworks,
                      webhookSecret: paymentSetting?.webhookSecret,
                      isActive: paymentSetting?.isActive,
                    }}
                    id={paymentSetting?._id}
                  />
                </CardContent>
              </Card>
            </Flex>
          </TabsContent>
        </Tabs>
      </Flex>
    </Flex>
  );
}

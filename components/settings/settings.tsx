"use client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PaymentGatewayForm } from "../payment-management/payment-gate-way-form";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Flex } from "../ui/flex";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DeliverySettings from "./delivery-settings";
import UsersSettings from "./users-settings";

export const Settings = () => {
  const paymentSetting = useQuery(api.payments.paymentSettings.paymentSettings);
  return (
    <div className="w-full h-full">
      <h1>Settings</h1>
      <Tabs defaultValue="payment">
        <TabsList>
          <TabsTrigger value="payment">Payment</TabsTrigger>
          <TabsTrigger value="delivery">Delivery</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>
        <TabsContent value="payment" className="w-full h-full">
          <Flex direction="col" gap="xl" className="w-full h-full">
            <h1 className="text-3xl font-bold">Payment Settings</h1>
            <Card className="w-full h-full">
              <CardHeader className="sr-only">
                <CardTitle className="text-2xl font-bold">
                  Payment Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <PaymentGatewayForm
                  // @ts-ignore
                  initialData={paymentSetting}
                  id={paymentSetting?._id}
                />
              </CardContent>
            </Card>
          </Flex>
        </TabsContent>
        <TabsContent value="delivery">
          <DeliverySettings />
        </TabsContent>
        <TabsContent value="users">
          <UsersSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}

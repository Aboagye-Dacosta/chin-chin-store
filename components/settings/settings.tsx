"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PaymentGatewayForm } from "../payment-management/payment-gate-way-form";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Flex } from "../ui/flex";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AssetsManagement } from "../file-upload/assets-management";
import { SupportForm } from "./support-form";

export const Settings = () => {
  const paymentSetting = useQuery(api.payments.paymentSettings.paymentSettings);
  return (
    <div className="w-full h-full p-7">
      <Tabs defaultValue="payment">
        <TabsList>
          <TabsTrigger value="payment">Payment</TabsTrigger>
          <TabsTrigger value="assets">Assets</TabsTrigger>
          <TabsTrigger value="support">Support</TabsTrigger>
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
                  // @ts-expect-error this is expected
                  initialData={paymentSetting}
                  id={paymentSetting?._id}
                />
              </CardContent>
            </Card>
          </Flex>
        </TabsContent>
        <TabsContent value="assets">
          <AssetsManagement />
        </TabsContent>
        <TabsContent value="support">
          <SupportForm />
        </TabsContent>
      </Tabs>
    </div>
  );
};

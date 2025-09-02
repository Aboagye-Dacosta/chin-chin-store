"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  paymentGatewaySettingsSchema,
  type PaymentGatewaySettings,
} from "@/schema/payment-settings-schema";
import { memo, useEffect, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { Flex } from "../ui/flex";
import { Switch } from "../ui/switch";
import { Id } from "@/convex/_generated/dataModel";
import { handleStatus } from "@/lib/handle-status";

const PAYMENT_METHODS = [
  { id: "MOBILE_MONEY", label: "Mobile Money" },
  { id: "CARD", label: "Card Payments" },
] as const;

const MOBILE_NETWORKS = [
  { id: "MTN", label: "MTN Mobile Money" },
  { id: "AIRTELTIGO", label: "AirtelTigo Money" },
  { id: "VODAFONE", label: "Telecel Cash" },
] as const;

interface PaymentGatewayFormProps {
  initialData?: Partial<PaymentGatewaySettings>;
  id?: string;
}

export const PaymentGatewayForm = memo(
  ({ initialData, id }: PaymentGatewayFormProps) => {
    const [isPending, setIsPending] = useState(false);
    const addPaymentSettings = useMutation(
      api.paymentGateway.createPaymentGatewaySetting
    );
    const updatePaymentSettings = useMutation(
      api.paymentGateway.updatePaymentGatewaySetting
    );

    const form = useForm<PaymentGatewaySettings>({
      resolver: zodResolver(paymentGatewaySettingsSchema),
      defaultValues: {
        isActive: initialData?.isActive || false,
        name: initialData?.name || "",
        environment: initialData?.environment || "TEST",
        apiKey: initialData?.apiKey || "",
        apiSecret: initialData?.apiSecret || "",
        webhookSecret: initialData?.webhookSecret || "",
        supportedMethods: initialData?.supportedMethods || [],
        supportedNetworks: initialData?.supportedNetworks || [],
      },
    });

    const handleSubmit = async (data: PaymentGatewaySettings) => {
      try {
        setIsPending(true);
        if (initialData) {
          await updatePaymentSettings({
            id: id as Id<"paymentGatewaySettings">,
            name: data.name,
            environment: data.environment,
            apiKey: data.apiKey,
            apiSecret: data.apiSecret,
            webhookSecret: data.webhookSecret || "",
            supportedMethods: data.supportedMethods || [],
            supportedNetworks: data.supportedNetworks || [],
            isActive: data.isActive,
          });
          toast.success("Payment gateway settings updated successfully");
        } else {
          await addPaymentSettings({
            name: data.name,
            environment: data.environment,
            apiKey: data.apiKey,
            apiSecret: data.apiSecret,
            webhookSecret: data.webhookSecret || "",
            supportedMethods: data.supportedMethods || [],
            supportedNetworks: data.supportedNetworks || [],
            isActive: true,
          });
          toast.success("Payment gateway settings added successfully");
        }
      } catch (error) {
        handleStatus({ error });
      } finally {
        setIsPending(false);
      }
    };

    useEffect(() => {
      if (initialData) {
        form.reset(initialData);
      }
    }, [initialData, form]);

    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <Card className="w-full border-none shadow-none">
            <Flex direction="row" gap="md" justify="between" className="w-full">
              <CardHeader className="w-full flex-1">
                <CardTitle>Payment Gateway Settings</CardTitle>
                <CardDescription>
                  Configure your payment gateway integration settings
                </CardDescription>
              </CardHeader>
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem>
                    <Flex direction="row" gap="md" justify="end">
                      <FormLabel>Active</FormLabel>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </Flex>
                    <FormDescription>
                      Enable or disable this payment gateway
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </Flex>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gateway Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Paystack, Flutterwave"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        A friendly name for this payment gateway
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="environment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Environment</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select environment" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="TEST">Test</SelectItem>
                          <SelectItem value="LIVE">Live</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Choose between test and live environment
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="apiKey"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>API Key</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Enter your API key"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="apiSecret"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>API Secret</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Enter your API secret"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="webhookSecret"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Webhook Secret (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Enter webhook secret"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Used to verify webhook authenticity
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="supportedMethods"
                  render={() => (
                    <FormItem>
                      <FormLabel>Payment Methods</FormLabel>
                      <div className="space-y-2">
                        {PAYMENT_METHODS.map((method) => (
                          <FormField
                            key={method.id}
                            control={form.control}
                            name="supportedMethods"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={method.id}
                                  className="flex flex-row items-start space-x-3 space-y-0"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(method.id)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([
                                              ...field.value,
                                              method.id,
                                            ])
                                          : field.onChange(
                                              field.value?.filter(
                                                (value) => value !== method.id
                                              )
                                            );
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal">
                                    {method.label}
                                  </FormLabel>
                                </FormItem>
                              );
                            }}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="supportedNetworks"
                  render={() => (
                    <FormItem>
                      <FormLabel>Mobile Money Networks</FormLabel>
                      <div className="space-y-2">
                        {MOBILE_NETWORKS.map((network) => (
                          <FormField
                            key={network.id}
                            control={form.control}
                            name="supportedNetworks"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={network.id}
                                  className="flex flex-row items-start space-x-3 space-y-0"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(
                                        network.id
                                      )}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([
                                              ...field.value,
                                              network.id,
                                            ])
                                          : field.onChange(
                                              field.value?.filter(
                                                (value) => value !== network.id
                                              )
                                            );
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal">
                                    {network.label}
                                  </FormLabel>
                                </FormItem>
                              );
                            }}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isPending}
                loading={isPending}
              >
                Save Payment Gateway Settings
              </Button>
            </CardContent>
          </Card>
        </form>
      </Form>
    );
  }
);

PaymentGatewayForm.displayName = "PaymentGatewayForm";

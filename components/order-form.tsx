"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Textarea } from "@/components/ui/textarea";
import { OrderFormData, orderSchema } from "@/schema/order-schema";
import { MapPin, MessageSquare, ShoppingBag } from "lucide-react";
import { useAppStore } from "@/hooks/use-app-store";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { displayMoney } from "@/lib/display-money";
import { useMemo, useState, useTransition } from "react";
import { Vendor, PaymentMethod } from "@/types/convex-types";
import { VendorSelectOptions } from "./vendor-select-options";
import { useOrderStore } from "@/store/use-order-store";
import { useRouter } from "next/navigation";
import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Flex } from "./ui/flex";
import { PaymentMethodSelector } from "./payment/payment-method-selector";
import { Label } from "./ui/label";
import { Id } from "@/convex/_generated/dataModel";
import { useStoreStore } from "@/store/use-store-store";
import { toast } from "sonner";
import PaystackPop from "@paystack/inline-js";
interface OrderFormProps {
  deliveryPrice?: number;
  vendors: Vendor[];
}

export function OrderForm({
  deliveryPrice = 0,
  vendors,
}: Readonly<OrderFormProps>) {
  const { store } = useStoreStore();
  const { totalPrice, serverItems } = useAppStore();
  const { setOrder, order } = useOrderStore();
  const currentUser = useQuery(api.users.getCurrentUser);
  const router = useRouter();
  const [submitting, startTransition] = useTransition();
  const makePayment = useMutation(api.payments.makePayment);
  const triggerPaymentWithPaystack = useAction(
    api.createTransferRecipient.initializePaystackTransaction
  );

  const form = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      userId: currentUser?._id ?? "",
      vendorId: order?.vendorId ?? vendors?.[0]?._id ?? "",
      items: serverItems?.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
      total: (totalPrice ?? 0) + (deliveryPrice ?? 0),
      deliveryAddressLabel: order?.deliveryAddressLabel ?? "",
      deliveryNote: order?.deliveryNote ?? "",
    },
  });

  const handleSubmit = (data: OrderFormData) => {
    setOrder(data);
    router.push("/cart/checkout/payment");
  };

  const hasContent = useMemo(
    () => (serverItems?.length ?? 0) > 0,
    [serverItems]
  );

  return (
    <Flex direction="col" gap="lg" className="w-full">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Recipient Vendor</CardTitle>
        </CardHeader>
        <CardContent>
          <Flex direction="col" gap="lg" className="w-full">
            <Flex direction="col" gap="md" className="w-full">
              <Label htmlFor="vendor" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Vendor
              </Label>

              <Select
                onValueChange={(value) => {
                  form.setValue("vendorId", value);
                }}
                value={form.getValues("vendorId")}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a vendor" />
                </SelectTrigger>
                <SelectContent>
                  {vendors.map((vendor) => (
                    <VendorSelectOptions key={vendor._id} vendor={vendor} />
                  ))}
                </SelectContent>
              </Select>
            </Flex>
          </Flex>
        </CardContent>
      </Card>

      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            <ShoppingBag className="h-5 w-5" />
            Delivery Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-6"
            >
              <FormField
                control={form.control}
                name="deliveryAddressLabel"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Delivery Address
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your full address" {...field} />
                    </FormControl>
                    <FormDescription>
                      Please provide your complete description of you location
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="deliveryNote"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Delivery Notes (Optional)
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Any special delivery instructions..."
                        className="resize-none"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Add any special instructions for the delivery person
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="border-t pt-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-lg font-semibold">Order Total</span>
                  <span className="text-2xl font-bold text-primary">
                    {displayMoney(totalPrice ?? 0)}
                  </span>
                </div>

                <Button
                  type="submit"
                  disabled={!hasContent}
                  className="w-full"
                  size="lg"
                >
                  Place Order
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </Flex>
  );
}

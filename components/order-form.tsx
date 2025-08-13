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
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { displayMoney } from "@/lib/display-money";
import { useMemo } from "react";
import { Vendor } from "@/types/convex-types";

interface OrderFormProps {
  onSubmit: (data: OrderFormData) => void;
  isLoading?: boolean;
  deliveryPrice?: number;
  vendors: Vendor[];
}

export function OrderForm({
  onSubmit,
  isLoading = false,
  deliveryPrice = 0,
  vendors,
}: Readonly<OrderFormProps>) {
  const { totalPrice, serverItems } = useAppStore();
  const form = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      vendorId: vendors?.length === 1 ? vendors[0]._id : "",
      items: serverItems?.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
      total: (totalPrice ?? 0) + (deliveryPrice ?? 0),
      deliveryAddressLabel: "",
      deliveryCity: "",
      deliveryNote: "",
    },
  });

  const handleSubmit = (data: OrderFormData) => {
    onSubmit(data);
  };

  const hasContent = useMemo(() => (serverItems?.length ?? 0) > 0, [serverItems]);

  return (
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
              name="vendorId"
              render={({ field }) => (
                <FormItem className="">
                  <FormLabel className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Vendor
                  </FormLabel>
                  <FormControl>
                    <Select
                      {...field}
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a vendor" />
                      </SelectTrigger>
                      <SelectContent>
                        {vendors.map((vendor) => (
                          <SelectItem key={vendor._id} value={vendor._id}>
                            {vendor.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
              name="deliveryCity"
              render={({ field }) => (
                <FormItem className="sm:col-span-1">
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your city" {...field} />
                  </FormControl>
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
                disabled={isLoading || !hasContent}
                className="w-full"
                size="lg"
              >
                {isLoading ? "Processing..." : "Place Order"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

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
import { MapPin, MessageSquare, ShoppingBag, Loader2 } from "lucide-react";
import { useAppStore } from "@/hooks/use-app-store";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { displayMoney } from "@/lib/display-money";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useOrderStore } from "@/store/use-order-store";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Flex } from "./ui/flex";
import { Label } from "./ui/label";
import { useStoreStore } from "@/store/use-store-store";

interface OrderFormProps {
  deliveryPrice?: number;
}

export function OrderForm({ deliveryPrice }: OrderFormProps) {
  const { store } = useStoreStore();
  const { totalPrice, serverItems } = useAppStore();
  const { setOrder, order } = useOrderStore();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Queries
  const currentUser = useQuery(api.users.getCurrentUser);
  const address = useQuery(api.users.getUserAddresses);
  const vendors = useQuery(api.vendors.getVendors, {
    storeId: store?._id!,
  });

  // Memoized calculations
  const orderTotal = useMemo(() => {
    const itemsTotal = totalPrice ?? 0;
    const delivery = deliveryPrice ?? store?.deliveryCharge ?? 0;
    return itemsTotal + delivery;
  }, [totalPrice, deliveryPrice, store?.deliveryCharge]);

  const formattedItems = useMemo(() => 
    serverItems?.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
    })) ?? [], 
    [serverItems]
  );

  const hasContent = useMemo(
    () => (serverItems?.length ?? 0) > 0,
    [serverItems]
  );

 

  // Form initialization
  const form = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      userId: "",
      vendorId: "",
      items: [],
      total: 0,
      deliveryAddressLabel: "",
      deliveryNote: "",
    },
  });

  // Update form when data loads
  useEffect(() => {
    if (!currentUser || !vendors || !address) return;

    const defaultVendor = order?.vendorId ?? vendors[0]?._id ?? "";
    const defaultAddress = order?.deliveryAddressLabel ?? address?.deliveryAddress ?? "";
    const defaultNote = order?.deliveryNote ?? address?.deliveryAddressNote ?? "";

    form.reset({
      userId: currentUser._id,
      vendorId: defaultVendor,
      items: formattedItems,
      total: orderTotal,
      deliveryAddressLabel: defaultAddress,
      deliveryNote: defaultNote,
    });
  }, [currentUser, vendors, address, formattedItems, orderTotal, order, form]);

  // Optimized submit handler
  const handleSubmit = useCallback(async (data: OrderFormData) => {
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      
      // Update order in store
      setOrder({
        userId: currentUser?._id ?? "",
        vendorId: data.vendorId,
        items: formattedItems,
        total: orderTotal,
        deliveryAddressLabel: data.deliveryAddressLabel,
        deliveryNote: data.deliveryNote,
      });

      // Navigate to payment
      router.push("/cart/checkout/payment");
    } catch (error) {
      console.error("Order submission failed:", error);
      // You might want to show a toast notification here
    } finally {
      setIsSubmitting(false);
    }
  }, [
    isSubmitting,
    currentUser,
    formattedItems,
    orderTotal,
    setOrder,
    router,
  ]);

  // // Loading state
  // if (isLoading) {
  //   return (
  //     <Flex direction="col" gap="lg" className="w-full">
  //       <Card className="w-full">
  //         <CardContent className="flex items-center justify-center py-8">
  //           <Loader2 className="h-6 w-6 animate-spin" />
  //           <span className="ml-2">Loading order form...</span>
  //         </CardContent>
  //       </Card>
  //     </Flex>
  //   );
  // }

  // No content state
  if (!hasContent) {
    return (
      <Flex direction="col" gap="lg" className="w-full">
        <Card className="w-full">
          <CardContent className="text-center py-8">
            <ShoppingBag className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium mb-2">Your cart is empty</p>
            <p className="text-muted-foreground">
              Add some items to your cart before placing an order
            </p>
          </CardContent>
        </Card>
      </Flex>
    );
  }

  return (
    <Flex direction="col" gap="lg" className="w-full h-full">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Vendor Selection */}
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Delivery Vendor
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="vendorId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Vendor</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={!vendors?.length}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Choose a vendor" />
                        </SelectTrigger>
                        <SelectContent>
                          {vendors?.map((vendor) => (
                            <SelectItem key={vendor._id} value={vendor._id}>
                              {vendor.user?.name || `Vendor ${vendor._id.slice(-4)}`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormDescription>
                      Select the vendor who will fulfill your order
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Delivery Information */}
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5" />
                Delivery Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="deliveryAddressLabel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Delivery Address *
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter your complete delivery address" 
                        {...field} 
                        className="min-h-[44px]"
                      />
                    </FormControl>
                    <FormDescription>
                      Provide your complete address including landmarks
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
                      Delivery Instructions
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Special instructions for the delivery person (e.g., gate code, floor number, etc.)"
                        className="resize-none min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Optional: Any special instructions to help with delivery
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Order Summary */}
          <Card className="w-full">
            <CardContent className="pt-6">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Subtotal ({serverItems?.length} items)</span>
                  <span>{displayMoney(totalPrice ?? 0)}</span>
                </div>
                
                {(deliveryPrice ?? store?.deliveryCharge ?? 0) > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Delivery Fee</span>
                    <span>{displayMoney(deliveryPrice ?? store?.deliveryCharge ?? 0)}</span>
                  </div>
                )}
                
                <div className="border-t pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">Total</span>
                    <span className="text-2xl font-bold text-primary">
                      {displayMoney(orderTotal)}
                    </span>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                disabled={!hasContent || isSubmitting || !form.formState.isValid}
                className="w-full mt-6"
                size="lg"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Processing Order...
                  </>
                ) : (
                  "Continue to Payment"
                )}
              </Button>
            </CardContent>
          </Card>
        </form>
      </Form>
    </Flex>
  );
}
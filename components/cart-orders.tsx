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
import {
  OrderFormData,
  orderSchema,
  unauthOrderSchema,
} from "@/schema/order-schema";
import { MapPin, ShoppingBag, ArrowLeft } from "lucide-react";
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
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Flex } from "./ui/flex";

import { CartSummary } from "./cart-summary";
import { useRouter } from "next/navigation";
import { useStoreStore } from "@/store/use-store-store";
import { Skeleton } from "./ui/skeleton";
import { Container } from "./ui/contaner";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@clerk/nextjs";
import { AuthOrderForms } from "./orders/auth-order-forms";
import { UnauthOrderForms } from "./orders/unauth-order-form";

export function OrdersPage() {
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const { store } = useStoreStore();
  const { isLoadingCartItems, totalPrice } = useAppStore();
  const { items } = useCart();
  const { setOrder, order } = useOrderStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Queries
  const currentUser = useQuery(api.users.getCurrentUser);
  const address = useQuery(api.users.getUserAddresses);
  const vendors = useQuery(api.vendors.getVendors, {
    storeId: store?._id,
  });

  // Memoized calculations
  const orderTotal = useMemo(() => {
    const itemsTotal = totalPrice ?? 0;
    const delivery = store?.deliveryCharge ?? 0;
    return itemsTotal + delivery;
  }, [totalPrice, store?.deliveryCharge]);

  const formattedItems = useMemo(
    () =>
      items?.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      })) ?? [],
    [items]
  );

  const hasContent = useMemo(() => (items?.length ?? 0) > 0, [items]);

  // Form initialization
  const form = useForm<OrderFormData>({
    resolver: zodResolver(isSignedIn ? orderSchema : unauthOrderSchema),
    defaultValues: {
      userId: "",
      vendorId: "",
      email: "",
      name: "",
      items: [],
      total: 0,
      deliveryAddressLabel: "",
      deliveryNote: "",
    },
  });

  // Update form when data loads
  useEffect(() => {
    if (!vendors) return;

    const defaultVendor = order?.vendorId ?? vendors?.[0]?._id ?? "";
    const defaultAddress =
      order?.deliveryAddressLabel ?? address?.deliveryAddress ?? "";
    const defaultNote =
      order?.deliveryNote ?? address?.deliveryAddressNote ?? "";

    form.reset({
      userId: currentUser?._id ?? "",
      vendorId: defaultVendor,
      email: order?.email ?? "",
      name: order?.name ?? "",
      items: formattedItems,
      total: orderTotal,
      deliveryAddressLabel: defaultAddress,
      deliveryNote: defaultNote,
    });
  }, [currentUser, vendors, address, formattedItems, orderTotal, order, form]);

  // Optimized submit handler
  const handleSubmit = useCallback(
    async (data: OrderFormData) => {
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
          name: data.name ?? "",
          email: data.email ?? "",
        });

        // Navigate to payment
        router.push("/cart/checkout/payment");
      } catch (error) {
        console.error("Order submission failed:", error);
        // You might want to show a toast notification here
      } finally {
        setIsSubmitting(false);
      }
    },
    [isSubmitting, currentUser, formattedItems, orderTotal, setOrder, router]
  );

  const handleBackToCart = () => {
    router.push("/cart");
  };

  if (isLoadingCartItems) {
    return (
      <Container className="grid max-w-5xl grid-cols-2 gap-4 mx-auto py-8">
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
      </Container>
    );
  }

  // No content state
  if (!hasContent) {
    return (
      <Flex direction="col" gap="lg" className="w-full mx-auto min-h-screen">
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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="h-max py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <Button
                variant="ghost"
                type="button"
                onClick={handleBackToCart}
                className="mb-4 -ml-2"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Cart
              </Button>
              <h1 className="text-3xl font-bold">
                Complete Your Order
              </h1>
              <p className="mt-2 text-gray-600">
                Review your items and provide delivery details to complete your
                purchase.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 h-full">
              <div className="w-full ">
                <Flex direction="col" gap="lg" className="w-full h-full">
                  <Card className="w-full lg:hidden">
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
                                    <SelectItem
                                      key={vendor._id}
                                      value={vendor._id}
                                    >
                                      {vendor.user?.name ||
                                        `Vendor ${vendor._id.slice(-4)}`}
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

                  {isSignedIn ? <AuthOrderForms /> : <UnauthOrderForms />}

                  {/* Order Summary */}
                  <Card className="w-full">
                    <CardContent className="pt-6">
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span>Subtotal ({items?.length} items)</span>
                          <span>{displayMoney(totalPrice ?? 0)}</span>
                        </div>

                        {(store?.deliveryCharge ?? 0) > 0 && (
                          <div className="flex justify-between text-sm">
                            <span>Delivery Fee</span>
                            <span>
                              {displayMoney(store?.deliveryCharge ?? 0)}
                            </span>
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
                        disabled={!hasContent || isSubmitting}
                        className="w-full mt-6"
                        size="lg"
                      >
                        Continue to Payment
                      </Button>
                    </CardContent>
                  </Card>
                </Flex>
              </div>

              <div className="lg:col-span-2 flex flex-col gap-4">
                {/* Vendor Selection */}
                <Card className="w-full hidden lg:block">
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
                                  <SelectItem
                                    key={vendor._id}
                                    value={vendor._id}
                                  >
                                    {vendor.user?.name ||
                                      `Vendor ${vendor._id.slice(-4)}`}
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
                <CartSummary deliveryPrice={store?.deliveryCharge ?? 0} />
              </div>
            </div>
          </div>
        </div>
      </form>
    </Form>
  );
}

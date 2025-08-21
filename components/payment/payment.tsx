"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, ArrowLeft, XCircle, RefreshCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PaymentOrderSummary } from "@/components/payment-order-summary";
import { PaymentMethodSelector } from "./payment-method-selector";
import { HelpCard } from "../payment-help-card";
import { useStoreStore } from "@/store/use-store-store";
import { api } from "@/convex/_generated/api";
import { useAction, useMutation, useQuery } from "convex/react";
import { toast } from "sonner";
import { Id } from "@/convex/_generated/dataModel";
import { useOrderStore } from "@/store/use-order-store";
import { PaymentMethod } from "@/types/convex-types";
import PaystackPop from "@paystack/inline-js";
import { useCart } from "@/hooks/use-cart";
import { nanoid } from "nanoid";
import { Flex } from "../ui/flex";
import { useAppStore } from "@/hooks/use-app-store";

export default function PaymentPage() {
  const [error, setError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("MOBILE_MONEY");
  const { cart } = useCart();
  const { serverItems } = useAppStore();
  const paymentButtonRef = useRef<HTMLButtonElement>(null);

  const router = useRouter();
  const { order,clearOrder } = useOrderStore();
  const { store } = useStoreStore();
  const [isPending, startTransition] = useTransition();

  const currentUser = useQuery(api.users.getCurrentUser);
  const createOrder = useMutation(api.orders.createOrder);
  const triggerPaymentWithPaystack = useAction(
    api.payments.paystack.initializePaystackTransaction
  );
  const makePayOnDelivery = useMutation(
    api.payments.addPayments.makePayOnDeliveryPayment
  );
  const validatePayment = useAction(
    api.payments.paystack.verifyPaystackTransaction
  );

  const onSubmit = async () => {
    startTransition(async () => {
      try {
        const orderResponse = await createOrder({
          vendorId: order?.vendorId as Id<"vendors">,
          deliveryAddressLabel: order?.deliveryAddressLabel!,
          deliveryNote: order?.deliveryNote!,
          amount: order?.total!,
          userId: currentUser?._id!,
          storeId: store?._id as Id<"stores">,
          trackingNumber: nanoid(),
          method: paymentMethod,
          items:
            serverItems.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
            })) ?? [],
          deliveryCharge: store?.deliveryCharge ?? 0,
        });

        if (paymentMethod === "PAYMENT_ON_DELIVERY") {
          try {
            await makePayOnDelivery({
              orderId: orderResponse,
              amount: order?.total!,
              cartId: cart?._id!,
              storeId: store?._id as Id<"stores">,
            });
            toast.success("Payment successful");
            clearOrder();
            router.push(`/orders/${orderResponse}`);
          } catch (error) {
            toast.error((error as Error)?.message);
          }
        }

        if (paymentMethod === "MOBILE_MONEY") {
          const paymentResponse = await triggerPaymentWithPaystack({
            amount: order?.total!,
            email: currentUser?.email!,
            orderId: orderResponse,
            vendorId: order?.vendorId as Id<"vendors">,
            callback_url: "",
          });

          const popup = new PaystackPop();
          popup.resumeTransaction(paymentResponse.access_code, {
            onSuccess: async (response) => {
              if (response.status === "success") {
                try {
                  await validatePayment({
                    orderId: orderResponse,
                    reference: response.reference,
                    paymentId: paymentResponse?.paymentId as Id<"payments">,
                    vendorId: order?.vendorId as Id<"vendors">,
                    cartId: cart?._id!,
                    storeId: store?._id as Id<"stores">,
                  });
                  toast.success("Payment successful");
                  clearOrder();
                  router.push(`/orders/${orderResponse}`);
                } catch (error) {
                  toast.error((error as Error)?.message);
                  setError((error as Error)?.message);
                }
              } else {
                toast.error("Payment failed");
                setError(
                  "Payment failed, please try again if it was not intentional"
                );
              }
            },
            onCancel: () => {
              toast.error("Payment cancelled");
              setError(
                "Payment cancelled, please try again if it was not intentional"
              );
            },
            onError: (err) => {
              toast.error(err.message);
              setError(err.message);
            },
          });
        } else {
          toast.success("Order placed successfully");
          clearOrder();
          router.push(`/orders/${orderResponse}`);
        }
      } catch (error) {
        toast.error((error as Error)?.message);
      }
    });
  };

  return (
    <main className="mx-auto max-w-4xl px-4 py-6 md:py-10">
      <div className="mb-4 flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <ShieldCheck className="h-4 w-4" />
          <span>Secure checkout</span>
        </div>
      </div>

      <div className="grid grid-cols-1 w-full gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3 w-full">
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Payment</CardTitle>
              <CardDescription>
                Choose a payment method and confirm your order.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <PaymentMethodSelector
                value={paymentMethod}
                onChange={(m) => {
                  setPaymentMethod(m);
                }}
              />

              {error && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertTitle>Payment Error</AlertTitle>
                  <AlertDescription className="text-sm">
                    {error}
                    <Flex className="w-full" direction="row" justify="end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setError(null);
                          paymentButtonRef.current?.click();
                        }}
                      >
                        <RefreshCcw className="mr-2 h-4 w-4" />
                        Retry
                      </Button>
                    </Flex>
                  </AlertDescription>
                </Alert>
              )}

              <div className="pt-2">
                <Button
                  ref={paymentButtonRef}
                  className="w-full"
                  type="button"
                  disabled={isPending}
                  loading={isPending}
                  onClick={onSubmit}
                >
                  Pay now
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6 lg:col-span-2">
          <PaymentOrderSummary />
          <HelpCard />
        </div>
      </div>
    </main>
  );
}

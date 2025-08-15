"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, ArrowLeft, XCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

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
import { PaymentStatusAlert } from "@/components/payment-status-alert";
import { PaymentMethodSelector } from "./payment-method-selector";
import { HelpCard } from "../payment-help-card";
import { useStoreStore } from "@/store/use-store-store";
import { api } from "@/convex/_generated/api";
import { useAction, useMutation, useQuery } from "convex/react";
import { toast } from "sonner";
import { Id } from "@/convex/_generated/dataModel";
import { useOrderStore } from "@/store/use-order-store";
import { Payment, PaymentMethod } from "@/types/convex-types";
import PaystackPop from "@paystack/inline-js";

export default function PaymentPage() {
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("MOBILE_MONEY");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Payment | null>(null);

  const router = useRouter();
  const { order } = useOrderStore();
  const { store } = useStoreStore();
  const [isPending, startTransition] = useTransition();

  const currentUser = useQuery(api.users.getCurrentUser);
  const createOrder = useMutation(api.payments.makePayment);
  const makePayment = useMutation(api.payments.makePayment);
  const triggerPaymentWithPaystack = useAction(
    api.createTransferRecipient.initializePaystackTransaction
  );

  const onSubmit = async () => {
    startTransition(async () => {
      try {
        const response = await createOrder({
          vendorId: order?.vendorId as Id<"vendors">,
          method: paymentMethod,
          deliveryAddressLabel: order?.deliveryAddressLabel!,
          deliveryNote: order?.deliveryNote!,
          amount: order?.total!,
          userId: currentUser?._id!,
          storeId: store?._id as Id<"stores">,
          trackingNumber: "",
          callback_url: "",
          transactionId: "",
          transactionReference: "",
          metadata: {},
        });

        if (paymentMethod === "MOBILE_MONEY") {
          const paymentResponse = await triggerPaymentWithPaystack({
            amount: order?.total!,
            email: currentUser?.email!,
            orderId: response,
            vendorId: order?.vendorId as Id<"vendors">,
            callback_url: "",
          });

          const popup = new PaystackPop();
          popup.resumeTransaction(paymentResponse.access_code, {
            onSuccess: (response) => {
              if (response.status === "success") {
                toast.success("Payment successful");
                router.push("/order");
              } else {
                toast.error("Payment failed");
              }
            },
            onCancel: () => {
              toast.error("Payment failed");
            },
            onError: (err) => {
              toast.error(err.message);
            },
          });
        } else {
          toast.success("Order placed successfully");
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
                  </AlertDescription>
                </Alert>
              )}

              <div className="pt-2">
                <Button
                  className="w-full"
                  type="button"
                  disabled={isPending}
                  loading={isPending}
                  onClick={onSubmit}
                >
                  Pay now
                </Button>
              </div>

              {result && <PaymentStatusAlert payment={result} />}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6 lg:col-span-2">
          <PaymentOrderSummary deliveryFee={0} />
          <HelpCard />
        </div>
      </div>
    </main>
  );
}

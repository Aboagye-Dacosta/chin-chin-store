"use client";

import { useMemo, useState } from "react";
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
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PaymentOrderSummary } from "@/components/payment-order-summary";
import { PaymentStatusAlert } from "@/components/payment-status-alert";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Payment } from "@prisma/client";
import { PaymentMethodSelector } from "./payment-method-selector";
import { HelpCard } from "../payment-help-card";
import { PaymentSchemaType, PaymentSchema } from "@/schema/payment-schema";
import { useStoreStore } from "@/store/use-store-store";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { Form, FormControl, FormField, FormItem, FormLabel } from "../ui/form";
import { RadioGroup } from "../ui/radio-group";
import { RadioGroupItem } from "@radix-ui/react-radio-group";
import { Flex } from "../ui/flex";
import { cn } from "@/lib/utils";
import { PhoneInput } from "../phone-input";
import { NetworkCode } from "@/constants/payment-constants";

export default function PaymentPage() {
  const router = useRouter();
  const { store } = useStoreStore();
  const paymentSettings = useQuery(api.payments.paymentSettings, {
    storeId: store?._id ?? "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<Payment | null>(null);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<PaymentSchemaType>({
    resolver: zodResolver(PaymentSchema),
    defaultValues: {
      method: "MOBILE_MONEY",
      paymentGatewaySettingsId: paymentSettings?._id ?? "",
      orderId: "",
      amount: 0,
      currency: "GHS",
      status: "PENDING",
      phoneNumber: "",
      mobileNetwork: undefined,
      transactionId: "",
      transactionReference: "",
      metadata: {},
    },
  });

  const method = form.watch("method");

  const networkOptions: NetworkCode[] = useMemo(() => {
    if (!paymentSettings || method !== "MOBILE_MONEY") return [];
    return paymentSettings.supportedNetworks?.length
      ? paymentSettings.supportedNetworks
      : ["MTN", "AIRTELTIGO", "TELECEL"];
  }, [paymentSettings, method]);

  const onSubmit = async (values: PaymentSchemaType) => {
    setSubmitting(true);
    setResult(null);
    setError(null);

    try {
      const payload = {
        orderId: values.orderId,
        amount: values.amount,
        method: values.method,
        paymentGatewaySettingsId: values.paymentGatewaySettingsId,
        phoneNumber: values.phoneNumber,
        mobileNetwork: values.mobileNetwork,
        currency: values.currency,
        status: values.status,
        transactionId: values.transactionId,
        transactionReference: values.transactionReference,
        metadata: values.metadata,
      };
    } catch (e: any) {
      setError(
        e?.message || "Payment could not be initiated. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="mx-auto max-w-4xl px-4 py-6 md:py-10">
      <div className="mb-4 flex items-center justify-between">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <ShieldCheck className="h-4 w-4" />
          <span>Secure checkout</span>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>Payment</CardTitle>
                <CardDescription>
                  Choose a payment method and confirm your order.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <PaymentMethodSelector
                  value={method}
                  onChange={(m) => form.setValue("method", m)}
                />

                <Separator />

                <div className="space-y-4">
                  <FormField
                    name="mobileNetwork"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Network Provider</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onChange={field.onChange}
                            value={field.value}
                          >
                            <Flex direction="row" gap="lg">
                              {networkOptions.map((network) => (
                                <FormLabel
                                  key={network}
                                  htmlFor={network}
                                  className={cn(
                                    "flex cursor-pointer items-center gap-3 rounded-md border-2 p-4 transition-colors",
                                    "hover:bg-accent hover:text-accent-foreground",
                                    "peer-data-[state=checked]:border-primary"
                                  )}
                                >
                                  <RadioGroupItem
                                    key={network}
                                    id={network}
                                    value={network}
                                    checked={field.value === network}
                                  />
                                  {network}
                                </FormLabel>
                              ))}
                            </Flex>
                          </RadioGroup>
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {method === "MOBILE_MONEY" && (
                    <FormField
                      name="phoneNumber"
                      control={form.control}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone number</FormLabel>
                          <FormControl>
                            <PhoneInput
                              value={field.value}
                              onChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  )}

                  {method === "PAYMENT_ON_DELIVERY" && (
                    <Alert>
                      <AlertTitle>You'll pay upon delivery</AlertTitle>
                      <AlertDescription className="text-sm">
                        Our courier will contact you before arriving. Please
                        have cash or a card-ready POS available.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>

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
                    type="submit"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <LoadingSpinner className="!h-4 !w-4" /> Processing...
                      </>
                    ) : method === "MOBILE_MONEY" ? (
                      "Pay now"
                    ) : (
                      "Confirm order"
                    )}
                  </Button>
                </div>

                {result && <PaymentStatusAlert payment={result} />}
              </CardContent>
            </Card>

            <div className="space-y-6 lg:col-span-2">
              <PaymentOrderSummary deliveryFee={0} />
              <HelpCard />
            </div>
          </div>
        </form>
      </Form>
    </main>
  );
}

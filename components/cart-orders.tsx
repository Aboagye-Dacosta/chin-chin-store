"use client";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CartSummary } from "./cart-summary";
import { OrderForm } from "./order-form";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useStoreStore } from "@/store/use-store-store";
import { useAppStore } from "@/hooks/use-app-store";
import { PaymentMethodSelector } from "./payment/payment-method-selector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Flex } from "./ui/flex";

export function OrdersPage() {
  const router = useRouter();
  const { store } = useStoreStore();
  const { isLoadingCartItems, serverItems } = useAppStore();
  const vendors = useQuery(api.vendors.getVendors, {
    storeId: store?._id!,
  });

  const deliveryCharge = useQuery(api.deliveryCharge.getDeliveryCharge, {
    storeId: store?._id!,
  });

  const handleBackToCart = () => {
    router.push("/cart");
  };

  if (isLoadingCartItems) {
    return null;
  }

  if (!isLoadingCartItems && !serverItems?.length) {
    router.push("/cart");
  }

  return (
    <div className="min-h-screen py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={handleBackToCart}
            className="mb-4 -ml-2"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Cart
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">
            Complete Your Order
          </h1>
          <p className="mt-2 text-gray-600">
            Review your items and provide delivery details to complete your
            purchase.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="w-full ">
            
              <OrderForm
                vendors={vendors ?? []}
                deliveryPrice={deliveryCharge?.amount ?? 0}
              />
          </div>

          <div className="lg:col-span-2">
            <CartSummary deliveryPrice={deliveryCharge?.amount ?? 0} />
          </div>
        </div>
      </div>
    </div>
  );
}

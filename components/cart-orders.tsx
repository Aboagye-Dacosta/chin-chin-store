"use client";
import { useState } from "react";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OrderFormData } from "@/schema/order-schema";
import { CartSummary } from "./cart-summary";
import { OrderForm } from "./order-form";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useStoreStore } from "@/store/use-store-store";

export function OrdersPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const router = useRouter();
  const { store } = useStoreStore();
  const vendors = useQuery(api.vendors.getVendors, {
    storeId: store?._id ?? "",
  });
  const deliveryCharge = useQuery(api.deliveryCharge.getDeliveryCharge, {
    storeId: store?._id ?? "",
  });

  const handleOrderSubmit = async (data: OrderFormData) => {
    setIsLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      console.log("Order submitted:", data);

      setOrderPlaced(true);
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToCart = () => {
    router.push("/cart");
  };

  if (orderPlaced) {
    return (
      <div className="min-h-screen py-8">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Order Placed Successfully!
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Thank you for your order. We'll send you a confirmation email with
              tracking details soon.
            </p>
            <Button onClick={handleBackToCart}>Continue Shopping</Button>
          </div>
        </div>
      </div>
    );
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
          <div className="w-full">
            <OrderForm
              onSubmit={handleOrderSubmit}
              isLoading={isLoading}
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

"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { memo } from "react";
import { displayMoney } from "@/lib/display-money";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";

export const OrderSummary = memo(
  ({
    totalPrice,
    itemCount,
    isAnyInactive,
    isAnyOutOfStock,
    isAnyMoreThanStock,
  }: {
    totalPrice: number;
    itemCount: number;
    isAnyInactive: boolean;
    isAnyOutOfStock: boolean;
    isAnyMoreThanStock: boolean;
  }) => {
    const { isSignedIn } = useAuth();
    const router = useRouter();

    const handleProceedToCheckout = () => {
      if (isAnyInactive || isAnyOutOfStock || isAnyMoreThanStock) return;
      router.push("/cart/checkout/order");
    };

    return (
      <TooltipProvider>
        <Card>
          <CardHeader>
            <CardTitle>Cart Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span>Number of items</span>
              <span>{itemCount}</span>
            </div>
            <div className="border-t pt-4">
              <div className="flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span>{displayMoney(totalPrice)}</span>
              </div>
            </div>

            <Tooltip>
              <TooltipTrigger
                className="w-full"
                onClick={handleProceedToCheckout}
              >
                <Button
                  className="w-full"
                  disabled={
                    isAnyInactive || isAnyOutOfStock || isAnyMoreThanStock
                  }
                  asChild
                >
                  Proceed to Checkout
                </Button>
              </TooltipTrigger>
              {(isAnyInactive || isAnyOutOfStock || isAnyMoreThanStock) && (
                <TooltipContent>
                  {isAnyInactive ? "Some items are inactive" : ""}
                  {isAnyOutOfStock ? "Some items are out of stock" : ""}
                  {isAnyMoreThanStock ? "Some items are more than stock" : ""}
                </TooltipContent>
              )}
            </Tooltip>

            <Link href="/products">
              <Button variant="outline" className="w-full cursor-pointer">
                Continue Shopping
              </Button>
            </Link>
          </CardContent>
        </Card>
        {!isSignedIn && (
          <Card className="w-full p-2 mt-4">
            <CardContent className="space-y-2">
              <CardDescription>
                Sign in before checkout if you want to persist your payments and
                track your order history and other features.
              </CardDescription>
              <Link href="/auth/signin">
                <Button
                  className="w-full cursor-pointer"
                  variant="outline"
                  asChild
                >
                  Sign In
                </Button>
              </Link>
              <p className="text-xs text-muted-foreground text-center">
                New customer?{" "}
                <Link href="/auth/signup" className="underline">
                  Create an account
                </Link>
              </p>
            </CardContent>
          </Card>
        )}
      </TooltipProvider>
    );
  }
);

OrderSummary.displayName = "OrderSummary";

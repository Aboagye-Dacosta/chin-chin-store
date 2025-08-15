"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { memo } from "react";
import { displayMoney } from "@/lib/display-money";
import { useAuth } from "@clerk/nextjs";

export const OrderSummary = memo(
  ({ totalPrice, itemCount }: { totalPrice: number; itemCount: number }) => {
    const { isSignedIn } = useAuth();
    return (
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

          {isSignedIn ? (
            <Link href="/cart/checkout/order">
              <Button className="w-full">Proceed to Checkout</Button>
            </Link>
          ) : (
            <div className="space-y-2">
              <Button className="w-full">
                <Link href="/auth/signin">Sign In to Checkout</Link>
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                New customer?{" "}
                <Link href="/auth/signup" className="underline">
                  Create an account
                </Link>
              </p>
            </div>
          )}
          <Link href="/products">
            <Button variant="outline" className="w-full">
              Continue Shopping
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }
);

OrderSummary.displayName = "OrderSummary";

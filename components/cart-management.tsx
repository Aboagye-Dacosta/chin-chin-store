"use client";

import { Container } from "@/components/ui/contaner";
import { useCart } from "@/hooks/use-cart";
import { useMemo } from "react";
import { CartItem } from "./cart-item";
import { EmptyCart } from "./empty-cart";
import { OrderSummary } from "./order-summary";
import { useAuth } from "@clerk/nextjs";
import { Skeleton } from "./ui/skeleton";

export function CartManagement() {
  const { items } = useCart();
  const { isSignedIn } = useAuth();

  const totalPrice = useMemo(() => {
    return items?.reduce((total, item) => total + item.total, 0);
  }, [items]);

  const itemCount = useMemo(() => {
    return items?.reduce((total, item) => total + item.quantity, 0);
  }, [items]);

  if (items && items?.length === 0) {
    return <EmptyCart />;
  }

  const isLoading = isSignedIn && items === undefined;

  return (
    <div className="bg-background">
      <Container className="container mx-auto px-4 py-8">
        {isLoading && (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton
                key={index}
                className="h-[100px] w-full max-w-md mx-auto"
              />
            ))}
          </div>
        )}

        {!isLoading && (
          <>
            <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                {items?.map((item) => (
                  <CartItem key={item._id} cartItem={item} />
                ))}
              </div>

              <div>
                <OrderSummary
                  totalPrice={totalPrice ?? 0}
                  itemCount={itemCount ?? 0}
                />
              </div>
            </div>
          </>
        )}
      </Container>
    </div>
  );
}

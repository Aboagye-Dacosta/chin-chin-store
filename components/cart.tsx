"use client";

import { Button } from "./ui/button";
import { ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/hooks/use-cart";
import { useMemo, useEffect, useRef, memo, useTransition } from "react";
import { CartBadge } from "./cart-badge";
import { useAppStore } from "@/hooks/use-app-store";
import { useAuth } from "@clerk/nextjs";

export default function Cart() {
  const { syncCartToServer } = useCart();
  const { isSignedIn } = useAuth();
  const [isPending, startTransition] = useTransition();

  const hasSyncedRef = useRef(false);
  const lastAuthStateRef = useRef(isSignedIn);
  const syncCartToServerRef = useRef(syncCartToServer);

  const { itemCount, isLoadingCartItems, isLoadingProducts, selectedCart } =
    useAppStore();

  useEffect(() => {
    syncCartToServerRef.current = syncCartToServer;
  });

  const storeId = useMemo(
    () => selectedCart?.storeId ?? "",
    [selectedCart?.storeId]
  );

  useEffect(() => {
    const justSignedIn = !lastAuthStateRef.current && isSignedIn;

    if (isSignedIn && (!hasSyncedRef.current || justSignedIn)) {
      if (storeId) {
        startTransition(
          async () =>
            await syncCartToServerRef.current().finally(() => {
              hasSyncedRef.current = true;
            })
        );
      }
    }

    if (!isSignedIn && lastAuthStateRef.current) {
      hasSyncedRef.current = false;
    }

    lastAuthStateRef.current = isSignedIn;
  }, [isSignedIn, storeId]);

  return (
    <Link href="/cart">
      <Button variant="ghost" size="icon" className="relative">
        <ShoppingCart className="h-5 w-5" />
        <CartBadge
          isLoading={isLoadingCartItems || isLoadingProducts || isPending}
          count={itemCount ?? 0}
        />
      </Button>
    </Link>
  );
}

export const MemoizedCart = memo(Cart);

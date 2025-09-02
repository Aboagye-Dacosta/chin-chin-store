"use client";

import { Button } from "./ui/button";
import { ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/hooks/use-cart";
import { useMemo, useEffect, useRef, memo, useState, useCallback } from "react";
import { CartBadge } from "./cart-badge";
import { useAppStore } from "@/hooks/use-app-store";
import { useAuth } from "@clerk/nextjs";
import { handleStatus } from "@/lib/handle-status";

export default function Cart() {
  const { syncCartToServer } = useCart();
  const { isSignedIn } = useAuth();
  const [isPending, setIsPending] = useState(false);

  const hasSyncedRef = useRef(false);
  const lastAuthStateRef = useRef(isSignedIn);
  const syncCartToServerRef = useRef(syncCartToServer);

  const { itemCount, isLoadingCartItems, selectedCart } = useAppStore();

  useEffect(() => {
    syncCartToServerRef.current = syncCartToServer;
  });

  const storeId = useMemo(
    () => selectedCart?.storeId ?? "",
    [selectedCart?.storeId]
  );

  const syncToServer = useCallback(async () => {
    try {
      setIsPending(true);
      await syncCartToServerRef.current().finally(() => {
        hasSyncedRef.current = true;
      });
      handleStatus({
        message: "Cart synced successfully",
        success: true,
      });
    } catch (error) {
      handleStatus({ error });
    } finally {
      setIsPending(false);
    }
  }, [syncCartToServerRef]);

  useEffect(() => {
    const justSignedIn = !lastAuthStateRef.current && isSignedIn;

    if (isSignedIn && (!hasSyncedRef.current || justSignedIn)) {
      if (storeId) {
        syncToServer();
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
          isLoading={(isLoadingCartItems && isSignedIn!) || isPending}
          count={itemCount ?? 0}
        />
      </Button>
    </Link>
  );
}

export const MemoizedCart = memo(Cart);

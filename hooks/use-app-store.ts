import { useMemo } from "react";
import { useCart } from "@/hooks/use-cart";
import { useStoreStore } from "@/store/use-store-store";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@clerk/nextjs";

export function useAppStore() {
  const { items } = useCart();
  const { isSignedIn } = useAuth();

  const store = useStoreStore((state) => state.store);
  const cart = useQuery(api.cart.getCart, { storeId: store?._id! });
  const cartItems = useQuery(api.cartItems.getCartItems, {
    cartId: cart?._id!,
  });

  const products = useQuery(api.products.getProducts, {
    storeId: store?._id!,
  });

  const itemCount = useMemo(() => {
    if (isSignedIn && cartItems) {
      return cartItems.reduce((total, item) => total + item.quantity, 0);
    }
    return items?.reduce((total, item) => total + item.quantity, 0);
  }, [isSignedIn, cartItems, items]);

  const totalPrice = useMemo(() => {
    if (isSignedIn && cartItems) {
      return cartItems.reduce((total, item) => {
        return total + item.total;
      }, 0);
    }
    return items?.reduce((total, item) => total + item.total, 0);
  }, [isSignedIn, cartItems, items]);

  return {
    products,
    itemCount,
    totalPrice,
    isLoadingCart: !cart,
    isLoadingCartItems: !cartItems,
    isLoadingProducts: !products,
    selectedCart: cart,
    serverItems: cartItems ?? [],
    cartId: cart?._id,
  };
}

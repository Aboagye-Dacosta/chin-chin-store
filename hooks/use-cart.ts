import { useCartStore } from "@/store/cart-store";
import { useAuth } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { useStoreStore } from "@/store/use-store-store";
import { CartItem, Product } from "@/types/convex-types";

export function useCart() {
  const {
    items,
    setCart,
    setCartId,
    addItem: localAdd,
    removeItem: localRemove,
    updateQuantity: localUpdate,
    clearCart: localClear,
    getTotalItems,
    getTotalPrice,
  } = useCartStore();

  const { isSignedIn } = useAuth();
  const syncCartToDB = useMutation(api.syncCartToDB.syncCartToDB);
  const store = useStoreStore((state) => state.store);
  const cart = useQuery(api.cart.getCart, { storeId: store?._id! });
  const cartItems = useQuery(api.cartItems.getCartItems, { cartId: cart?._id! });
  const products = useQuery(api.products.getProducts, { storeId: store?._id! });
  const addCartItem = useMutation(api.cartItems.addCartItem);
  const removeCartItem = useMutation(api.cartItems.removeCartItem);
  const updateCartItem = useMutation(api.cartItems.updateCartItem);
  const categories = useQuery(api.categories.getCategories);


  const syncCartToServer = async () => {
    if (!items) return;
    if (isSignedIn && items.length > 0) {
      for (const item of items) {
        await syncCartToDB({
          storeId: store?._id!,
          cartId: cart?._id!,
          productId: item.productId,
          quantity: item.quantity,
          existingQuantity: item.quantity,
          productPrice: products?.find((p) => p._id === item.productId)?.price ?? 0,
        });
      }
      localClear();
      if (!cart) return;
      setCartId(cart._id);
    }
  };

  const syncServerToCart = async (storeId: string) => {
    if (isSignedIn) {
      if (!cartItems) return;
      setCart(
        cartItems?.map((item) => ({
          ...item,
          existingQuantity: item.quantity,
        }))
      );
      if (!cart) return;
      setCartId(cart._id);
    }
  };

  const addItem = async (
    item: Product,
  ) => {
    if (isSignedIn) {
      console.log({
        cartId: cart?._id!,
        productId: item._id,
        quantity: 1,
        productPrice: item.price,
      })

      await addCartItem({
        storeId: store?._id!,
        cartId: cart?._id!,
        productId: item._id,
        quantity: 1,
        productPrice: item.price,
      });
    }
    else localAdd(item);
  };

  const removeItem = async (id: CartItem["_id"]) => {
    if (isSignedIn) await removeCartItem({ id });
    else localRemove(id);
  };

  const updateQuantity = async (id: CartItem["_id"], quantity: number, productPrice: number) => {
    if (isSignedIn) await updateCartItem({ id, quantity, productPrice });
    else localUpdate(id, quantity);
  };



  return {
    items: isSignedIn ? cartItems : items,
    products,
    categories,
    setCart,
    addItem,
    removeItem,
    updateQuantity,
    getTotalItems,
    getTotalPrice,
    syncCartToServer,
    syncServerToCart,
  };
}

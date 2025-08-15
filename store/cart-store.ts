import { create } from "zustand";
import { createJSONStorage, devtools, persist } from "zustand/middleware";
import { Cart, CartItem, Product } from "@/types/convex-types";

interface CartActions {
  setCart: (items: CartItem[]) => void;
  addItem: (item: Product) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  setCartId: (cartId: Cart["_id"] | null) => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
}

interface StoreCart {
  items: CartItem[] | null;
  cartId: Cart["_id"] | null;
  removedItems: CartItem["_id"][] | null;
}

interface CartStore extends StoreCart, CartActions {}

export const useCartStore = create<CartStore>()(
  devtools(
    persist(
      (set, get) => ({
        cartId: null,
        items: [],
        removedItems: null,
        setCart: (items) => set(() => ({ items: items })),
        addItem: (product: Product) => {
          const existingItem = get()?.items?.find(
            (i) => i.productId === product._id
          );
          if (existingItem) {
            set((state) => ({
              items: state?.items?.map((i) =>
                i.productId === product._id
                  ? {
                      ...i,
                      quantity: i.quantity + 1,
                      total: i.total + product.price,
                    }
                  : i
              ),
            }));
          } else {
            set((state) => {
              return {
                ...state,
                items: [
                  ...(state?.items ?? []),
                  {
                    _id: "" as unknown as CartItem["_id"],
                    _creationTime: Date.now(),
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    productId: product._id,
                    quantity: 1,
                    cartId: state?.cartId,
                    total: product.price,
                  },
                ],
              } as CartStore;
            });
          }
        },
        setCartId: (cartId) => set(() => ({ cartId: cartId })),
        removeItem: (id) =>
          set((state) => ({
            items: state?.items?.filter((item) => item._id !== id),
            removedItems: [
              ...(state?.removedItems ?? []),
              id,
            ] as CartItem["_id"][],
          })),
        updateQuantity: (id, quantity) =>
          set((state) => ({
            items: state?.items?.map((item) =>
              item._id === id
                ? { ...item, quantity, total: item.total * quantity }
                : item
            ),
          })),
        clearCart: () => set(() => ({ items: null, removedItems: null })),
        getTotalPrice: () => {
          return (
            get()?.items?.reduce((total, item) => total + item.total, 0) ?? 0
          );
        },
        getTotalItems: () => {
          return (
            get()?.items?.reduce((total, item) => total + item.quantity, 0) ?? 0
          );
        },
      }),
      {
        name: "cart-storage",
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
          items: state?.items?.map((item) => ({
            ...item,
            existingQuantity: item?.existingQuantity ?? 0,
            removedItems: state?.removedItems ?? [],
          })),
        }),
      }
    )
  )
);

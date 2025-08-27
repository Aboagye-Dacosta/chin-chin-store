import { create } from "zustand";
import { createJSONStorage, devtools, persist } from "zustand/middleware";

interface OrderState {
  orders: string[];
}

interface OrderActions {
  addOrder: (order: string) => void;
  clearOrders: () => void;
}

type OrderStore = OrderState & OrderActions;

export const useLocalOrdersStore = create<OrderStore>()(
  devtools(
    persist(
      (set) => ({
        orders: [],
        addOrder: (order) =>
          set((orders) => ({ orders: [...orders.orders, order] })),
        clearOrders: () => set({ orders: [] }),
      }),
      {
        name: "local-orders-storage",
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({ orders: state.orders }),
      }
    )
  )
);

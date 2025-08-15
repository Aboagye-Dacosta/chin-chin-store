import { OrderFormData } from "@/schema/order-schema";
import { create } from "zustand";
import { createJSONStorage, devtools, persist } from "zustand/middleware";

interface OrderState {
  order: OrderFormData | null;
}

interface OrderActions {
  setOrder: (order: OrderFormData) => void;
  clearOrder: () => void;
}

type OrderStore = OrderState & OrderActions;

export const useOrderStore = create<OrderStore>()(
  devtools(
    persist(
      (set) => ({
        order: null,
        setOrder: (order) => set(() => ({ order: order })),
        clearOrder: () => set({ order: null }),
      }),
      {
        name: "order-storage",
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({ order: state.order }),
      }
    )
  )
);

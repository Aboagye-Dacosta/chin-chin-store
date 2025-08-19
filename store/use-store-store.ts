import { StoreWithLocation } from "@/types/convex-types";
import { create } from "zustand";
import { createJSONStorage, devtools, persist } from "zustand/middleware";

interface StoreState {
  store: StoreWithLocation | null;
}

interface StoreActions {
  setStore: (store: StoreWithLocation) => void;
}

type StoreStore = StoreState & StoreActions;

export const useStoreStore = create<StoreStore>()(
  devtools(
    persist(
      (set) => ({
        store: null,
        setStore: (store) => set(() => ({ store })),
      }),
      {
        name: "store-storage",
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({ store: state.store }),
      }
    )
  )
);

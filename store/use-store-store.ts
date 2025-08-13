import { Store } from "@/types/convex-types";
import { create } from "zustand";
import { createJSONStorage, devtools, persist } from "zustand/middleware";

interface StoreState {
  store: Store | null;
}

interface StoreActions {
  setStore: (store: Store) => void;
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

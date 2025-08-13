import { create } from "zustand";
import { createJSONStorage, devtools, persist } from "zustand/middleware";

// Define the store state type
interface CounterState {
  count: number;
}

// Define the store actions type
interface CounterActions {
  increment: (amount?: number) => void;
  decrement: (amount?: number) => void;
  reset: () => void;
}

// Combine state and actions for the complete store type
type CounterStore = CounterState & CounterActions;

// Create the store with middleware
export const useCounterStore = create<CounterStore>()(
  devtools(
    persist(
      (set) => ({
        // Initial state
        count: 0,

        // Actions
        increment: (amount = 1) =>
          set(
            (state) => ({ count: state.count + amount }),
            false,
            "counter/increment",
          ),

        decrement: (amount = 1) =>
          set(
            (state) => ({ count: state.count - amount }),
            false,
            "counter/decrement",
          ),

        reset: () => set({ count: 0 }, false, "counter/reset"),
      }),
      {
        name: "counter-storage", // unique name for localStorage
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({ count: state.count }), // only persist count
      },
    ),
  ),
);

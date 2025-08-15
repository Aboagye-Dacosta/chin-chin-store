import { create } from "zustand";
import { createJSONStorage, devtools, persist } from "zustand/middleware";

interface AppThemeState {
  appColor: string;
  categoryColors: Record<string, string>;
}

interface AppThemeActions {
  setAppColor: (appColor: string) => void;
  setCategoryColors: (categoryColors: Record<string, string>) => void;
  reset: () => void;
}

type AppThemeStore = AppThemeState & AppThemeActions;

export const useAppThemeStore = create<AppThemeStore>()(
  devtools(
    persist(
      (set) => ({
        appColor: "#8B4513",
        categoryColors: {},

        setAppColor: (appColor) => set((state) => ({ appColor })),

        setCategoryColors: (categoryColors) =>
          set((state) => ({ categoryColors })),

        reset: () => set({ appColor: "#8B4513", categoryColors: {} }),
      }),
      {
        name: "app-theme-storage",
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
          appColor: state.appColor,
          categoryColors: state.categoryColors,
        }),
      }
    )
  )
);

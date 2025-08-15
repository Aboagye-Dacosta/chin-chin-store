"use client";

import React, { useEffect, ReactNode, memo } from "react";
import { useAppThemeStore } from "@/store/use-app-theme";

type ThemeProviderProps = {
  children: ReactNode;
};

const MemoizedChildren = memo(({ children }: { children: ReactNode }) => {
  return <>{children}</>;
});

export default function ThemeProvider({ children }: ThemeProviderProps) {
  const appColor = useAppThemeStore((state) => state.appColor);
  const [isHydrated, setIsHydrated] = React.useState(false);

  useEffect(() => {
    document.documentElement.style.setProperty("--primary", appColor);
    setIsHydrated(true);
  }, [appColor]);


  if (!appColor || !isHydrated) {
    return null;
  }


  return <MemoizedChildren>{children}</MemoizedChildren>;
}

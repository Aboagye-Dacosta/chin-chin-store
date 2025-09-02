import ConvexClientProvider from "./convex-provider";
import { ClerkProvider } from "@clerk/nextjs";
import ThemeProvider from "./theme-provider";
import { ThemeProvider as NextThemesProvider } from "next-themes";

export const Provider = async ({
  children,
}: Readonly<{ children: React.ReactNode }>) => {
  return (
    <ClerkProvider >
      <ConvexClientProvider>
        <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
          <ThemeProvider>{children}</ThemeProvider>
        </NextThemesProvider>
      </ConvexClientProvider>
    </ClerkProvider>
  );
};

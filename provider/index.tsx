import ConvexClientProvider from "./convex-provider";
import { ClerkProvider } from "@clerk/nextjs";
import ThemeProvider from "./theme-provider";

export const Provider = async ({
  children,
}: Readonly<{ children: React.ReactNode }>) => {
  return (
    <ClerkProvider >
      <ConvexClientProvider>
        <ThemeProvider>{children}</ThemeProvider>
      </ConvexClientProvider>
    </ClerkProvider>
  );
};

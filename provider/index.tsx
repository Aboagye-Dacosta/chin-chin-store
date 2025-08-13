import { ReactQueryProvider } from "./query-provider";
import ConvexClientProvider from "./convex-provider";
import { ClerkProvider } from "@clerk/nextjs";

export const Provider = async ({
  children,
}: Readonly<{ children: React.ReactNode }>) => {
  return (
    <ClerkProvider>
      <ConvexClientProvider>
        <ReactQueryProvider>{children}</ReactQueryProvider>
      </ConvexClientProvider>
    </ClerkProvider>
  );
};

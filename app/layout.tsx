import "./globals.css";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import { Provider } from "@/provider";
import { AppThemeFloatingActionButton } from "@/components/app-theme-floating-action-button";

import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "ChipMart - Workplace Chip Store",
  description: "Premium chips delivery for your workplace",
  generator: "v0.dev",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={cn(inter.className, "h-screen overflow-hidden")}>
        <Provider>
          {children}
          <Toaster richColors />
          <AppThemeFloatingActionButton />
        </Provider>
      </body>
    </html>
  );
}

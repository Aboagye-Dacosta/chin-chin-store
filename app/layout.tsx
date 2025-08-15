import "./globals.css";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import { Provider } from "@/provider";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";
import { ourFileRouter } from "@/app/api/uploadthing/core";
import { AppThemeFloatingActionButton } from "@/components/app-theme-floating-action-button";
import { ThemeProvider } from "next-themes";

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
      <body className={inter.className}>
        <ThemeProvider>
          <Provider>
            {children}
            <Toaster richColors />
            <AppThemeFloatingActionButton />
          </Provider>
          <NextSSRPlugin routerConfig={extractRouterConfig(ourFileRouter)} />
        </ThemeProvider>
      </body>
    </html>
  );
}

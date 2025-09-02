"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";

export default function SideBarItem({
  url,
  children,
}: Readonly<{
  url: string;
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  let isActive = pathname?.startsWith(url);

  if (pathname !== "/dashboard" && url === "/dashboard") {
    isActive = false;
  }
  return (
    <Link href={url} className="flex w-full items-center justify-start ">
      <Button
        variant={isActive ? "default" : "ghost"}
        size="icon"
        className="flex items-center justify-start w-full gap-2 px-3"
        asChild
      >
        {children}
      </Button>
    </Link>
  );
}

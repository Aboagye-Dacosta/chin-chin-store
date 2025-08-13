"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";

export default function SideBarItem({
  href,
  icon,
  label,
}: Readonly<{
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}>) {
  const pathname = usePathname();
  const Icon = icon;
  let isActive = pathname?.startsWith(href);

  if (pathname !== "/admin" && href === "/admin") {
    isActive = false;
  }
  return (
    <Button
      variant={isActive ? "default" : "ghost"}
      size="icon"
      className="flex items-center justify-start w-full"
      asChild
    >
      <Link
        href={href}
        className="flex w-full items-center justify-start gap-2 px-3"
      >
        <Icon className="h-5 w-5" />
        {label}
      </Link>
    </Button>
  );
}

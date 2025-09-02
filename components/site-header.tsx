"use client";

import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { DASHBOARD_ROUTES_LABEL } from "@/constants/dashboard-routes";
import { ProfileItem } from "./profile-item";

export function SiteHeader() {
  const pathname = usePathname();
  const path: string = useMemo(
    () => pathname?.split("/")?.slice(1)?.join("/") ?? "",
    [pathname]
  );
  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-base font-medium flex-1">
          {DASHBOARD_ROUTES_LABEL[path]}
        </h1>
        <div className="self-end">
          <ProfileItem />
        </div>
      </div>
    </header>
  );
}

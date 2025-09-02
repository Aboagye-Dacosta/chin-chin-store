"use client";

import * as React from "react";


import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { IconLogo } from "./ui/icon-logo";
import { DASHBOARD_ROUTES, DASHBOARD_SECONDARY_ROUTES } from "@/constants/dashboard-routes";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";


export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const currentUser = useQuery(api.users.getCurrentUser);
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href="/">
                <IconLogo />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={DASHBOARD_ROUTES} userRole={currentUser?.role} />
        <NavSecondary
          items={DASHBOARD_SECONDARY_ROUTES}
          className="mt-auto"
          userRole={currentUser?.role}
        />
      </SidebarContent>
    </Sidebar>
  );
}

"use client";

import * as React from "react";
import { type Icon } from "@tabler/icons-react";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
} from "@/components/ui/sidebar";
import SideBarItem from "./side-bar-nav-item";

export function NavSecondary({
  items,
  userRole,
  ...props
}: {
  items: {
    title: string;
    url: string;
    icon: Icon;
    allowedRoles?: string[];
  }[];
  userRole?: string;
} & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
  return (
    <SidebarGroup {...props}>
      <SidebarGroupContent>
        <SidebarMenu>
          {items
            .filter((item) =>
              item?.allowedRoles
                ? item?.allowedRoles.includes(userRole ?? "")
                : true
            )
            .map((item) => (
              <SideBarItem url={item.url} key={item.title}>
                <item.icon />
                <span>{item.title}</span>
              </SideBarItem>
            ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

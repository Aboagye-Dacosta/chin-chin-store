"use client";

import { type Icon } from "@tabler/icons-react";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
} from "@/components/ui/sidebar";
import SideBarItem from "./side-bar-nav-item";

export function NavMain({
  items,
  userRole,
}: Readonly<{
  items: {
    title: string;
    url: string;
    icon?: Icon;
    allowedRoles?: string[];
  }[];
  userRole?: string;
}>) {
  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          {items
            .filter((item) =>
              item?.allowedRoles
                ? item.allowedRoles?.includes(userRole ?? "")
                : true
            )
            .map((item) => (
              <SideBarItem url={item.url} key={item.title}>
                {item.icon && <item.icon />}
                <span>{item.title}</span>
              </SideBarItem>
            ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

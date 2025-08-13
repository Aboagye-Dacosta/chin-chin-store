"use client";
import { Card } from "@/components/ui/card";
import SideBarItem from "./side-bar-nav-item";
import { DASHBOARD_ROUTES } from "@/constants/dashboard-routes";
import { Flex } from "./ui/flex";
import Link from "next/link";
import { IconLogo } from "./ui/icon-logo";

export function AdminSidebar() {
  return (
    <Card className="w-full h-full shadow-none border-0 border-r rounded-none p-4">
      <Flex direction="col" className="gap-7">
        <Link href="/">
          <IconLogo />
        </Link>
        <Flex direction="col" justify="between">
          <nav className="space-y-2">
            {DASHBOARD_ROUTES.map((item) => (
              <SideBarItem
                key={item.id}
                href={item.id}
                icon={item.icon}
                label={item.label}
              />
            ))}
          </nav>
        </Flex>
      </Flex>
    </Card>
  );
}

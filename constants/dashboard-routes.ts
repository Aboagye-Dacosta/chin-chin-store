import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  CircleDollarSign,
  ShoppingBag,
} from "lucide-react";
import { ROLES } from "./roles";
import { IconHelp, IconSearch, IconSettings } from "@tabler/icons-react";

export const DASHBOARD_ROUTES = [
  { url: "/dashboard", title: "Dashboard", icon: LayoutDashboard },
  {
    url: "/dashboard/products",
    title: "Products",
    icon: Package,
    allowedRoles: [ROLES.ADMIN],
  },
  {
    url: "/dashboard/vendors",
    title: "Vendors",
    icon: Users,
    allowedRoles: [ROLES.ADMIN],
  },
  {
    url: "/dashboard/stores",
    title: "Stores",
    icon: ShoppingCart,
    allowedRoles: [ROLES.ADMIN],
  },
  { url: "/dashboard/orders", title: "Orders", icon: ShoppingBag },
  { url: "/dashboard/payments", title: "Payments", icon: CircleDollarSign },
  { url: "/dashboard/stocks", title: "Stocks", icon: ShoppingCart },
];

export const DASHBOARD_SECONDARY_ROUTES = [
  {
    title: "Settings",
    url: "/dashboard/settings",
    icon: IconSettings,
    allowedRoles: [ROLES.ADMIN],
  },
  {
    title: "Get Help",
    url: "#",
    icon: IconHelp,
    allowedRoles: [ROLES.VENDOR],

  },
];

export const DASHBOARD_ROUTES_LABEL = {
  dashboard: "Dashboard",
  "dashboard/products": "Products",
  "dashboard/vendors": "Vendors",
  "dashboard/stores": "Stores",
  "dashboard/orders": "Orders",
  "dashboard/payments": "Payments",
  "dashboard/stocks": "Stocks",
  "dashboard/settings": "Settings",
};

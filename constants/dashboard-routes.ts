import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Settings,
  UserPlus,
  Users,
  CircleDollarSign,
  ShoppingBag,
} from "lucide-react";

export const DASHBOARD_ROUTES = [
  { id: "/admin", label: "Admin", icon: LayoutDashboard },
  { id: "/admin/products", label: "Products", icon: Package },
  { id: "/admin/vendors", label: "Vendors", icon: Users },
  { id: "/admin/store", label: "Store", icon: ShoppingCart },
  { id: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { id: "/admin/payments", label: "Payments", icon: CircleDollarSign },
  {
    id: "/admin/vendor-registration",
    label: "Vendor Registration",
    icon: UserPlus,
  },
  { id: "/admin/settings", label: "Settings", icon: Settings },
];

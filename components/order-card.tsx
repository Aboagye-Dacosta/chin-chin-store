"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { OrderWithItems, OrderStatus } from "@/types/convex-types";
import { displayMoney } from "@/lib/display-money";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useMemo } from "react";

interface OrderCardProps {
  order: OrderWithItems;
}

export function OrderCard({ order }: Readonly<OrderCardProps>) {
  const getStatusBadgeVariant = (status: OrderStatus) => {
    switch (status) {
      case "DELIVERED":
        return "default";
      case "PROCESSING":
        return "outline";
      case "PENDING":
        return "destructive";
      case "CANCELLED":
        return "destructive";
      default:
        return "outline";
    }
  };

  const itemsCount = useMemo(
    () => order.items.reduce((total, item) => total + item.quantity, 0),
    [order]
  );

  return (
    <Link href={`/orders/${order._id}`}>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex flex-col gap-1">
            <CardTitle className="text-lg font-medium">
              Order #{order.trackingNumber.substring(0, 8)}
            </CardTitle>
            <CardDescription className="text-sm text-gray-500">
              {new Date(order.createdAt).toLocaleDateString()}
            </CardDescription>
          </div>
          <Badge variant={getStatusBadgeVariant(order.status)}>
            {order.status}
          </Badge>
        </CardHeader>

        <CardContent>
          <div className={cn("flex justify-between items-center w-full")}>
            <div className="text-sm text-gray-600">
              {itemsCount} item{itemsCount !== 1 ? "s" : ""}
            </div>
            <div className="font-semibold text-gray-900 self-end">
              {displayMoney(order.total)}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

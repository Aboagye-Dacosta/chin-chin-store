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
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {order.items.length} item{order.items.length !== 1 ? "s" : ""}
            </div>
            <div className="font-semibold text-gray-900">
              {displayMoney(order.total)}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

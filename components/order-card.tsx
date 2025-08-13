"use client"

import { useTransition } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { OrderStatus } from "@prisma/client"
import { cancelOrder } from "@/actions/cancel-order-action"
import { Orders } from "@/lib/fetch/fetch-orders"
import { toast } from "sonner"

interface OrderCardProps {
  order: Orders[number]
}

export function OrderCard({ order }: Readonly<OrderCardProps>) {
  const [isPending, startTransition] = useTransition()
  const totalOrderPrice = order.items.reduce((sum, item) => sum + item.quantity * item.product.price, 0)

  const getStatusBadgeVariant = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.Delivered:
        return "default";
      case OrderStatus.Processing:
        return "outline";
      case OrderStatus.Pending:
        return "destructive";
      case OrderStatus.Cancelled:
        return "destructive";
      default:
        return "outline";
    }
  };

  const handleCancelOrder = async () => {
    if (!confirm("Are you sure you want to cancel this order? This action cannot be undone.")) {
      return;
    }

    startTransition(async () => {
      const result = await cancelOrder(order.id);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    });
  };

  const canCancel = order.status === OrderStatus.Pending || order.status === OrderStatus.Processing;

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex flex-col gap-1">
          <CardTitle className="text-lg font-medium">Order #{order.id.substring(0, 8)}</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant={getStatusBadgeVariant(order.status)}>{order.status}</Badge>
            {order.trackingNumber && (
              <span className="text-sm text-muted-foreground">
                Tracking: {order.trackingNumber}
              </span>
            )}
          </div>
        </div>
        <div className="text-sm text-muted-foreground">
          {new Date(order.createdAt).toLocaleDateString()}
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px] sr-only">Image</TableHead>
              <TableHead>Product</TableHead>
              <TableHead className="text-center">Quantity</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {order.items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <Avatar className="h-12 w-12 rounded-md">
                    <AvatarImage src={item.product.image || "/placeholder.svg?height=50&width=50&query=product image"} alt={item.product.title} />
                    <AvatarFallback>{item.product.title.charAt(0)}</AvatarFallback>
                  </Avatar>
                </TableCell>
                <TableCell className="font-medium">{item.product.title}</TableCell>
                <TableCell className="text-center">{item.quantity}</TableCell>
                <TableCell className="text-right">${item.product.price.toFixed(2)}</TableCell>
                <TableCell className="text-right">${(item.quantity * item.product.price).toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="mt-4 flex justify-between items-center">
          <div className="text-lg font-semibold">
            Total: ${totalOrderPrice.toFixed(2)}
          </div>
          {canCancel && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancelOrder}
              disabled={isPending}
            >
              {isPending ? "Cancelling..." : "Cancel Order"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

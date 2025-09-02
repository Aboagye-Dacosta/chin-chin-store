"use client";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { displayMoney } from "@/lib/display-money";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { Order, OrderStatus } from "@/types/convex-types";
import { toast } from "sonner";
import { PaymentDetailCard } from "./payment-card";
import { Container } from "../ui/contaner";
import { Id } from "@/convex/_generated/dataModel";
import { handleStatus } from "@/lib/handle-status";

export default function UserOrderDetails({
  orderId,
}: Readonly<{ orderId: string }>) {
  const [open, setOpen] = useState(false);
  const order = useQuery(api.orders.getOrderById, {
    orderId: orderId as Order["_id"],
  });

  const getStatusBadgeVariant = (status: OrderStatus) => {
    switch (status) {
      case "DELIVERED":
        return "default";
      case "PROCESSING":
        return "processing";
      case "PENDING":
        return "destructive";
      case "CANCELLED":
        return "destructive";
      default:
        return "outline";
    }
  };

  const canCancel =
    order?.status === "PENDING" || order?.status === "PROCESSING";

  const [isPending, setIsPending] = useState(false);
  const cancelOrder = useMutation(api.orders.cancelOrder);

  const handleCancelOrder = async () => {
    try {
      setIsPending(true);
      await cancelOrder({
        orderId: (order?._id ?? "") as Id<"orders">,
        storeId: (order?.storeId ?? "") as Id<"stores">,
      });
      toast.success("Order cancelled successfully");
    } catch (error) {
      handleStatus({ error });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <>
      <Container>
        <div className="flex flex-col gap-4  min-h-screen max-w-5xl mx-auto w-full py-8">
          <h1 className="text-2xl font-semibold">Order Details</h1>
          <Card className="w-full">
            <CardHeader className="flex flex-col space-y-0 pb-2 w-full">
              <div className="flex  flex-row justify-between items-center gap-1 w-full">
                <CardTitle className="text-lg font-medium">
                  Order #{order?.trackingNumber?.substring(0, 8)}
                </CardTitle>
                <div className="text-sm text-muted-foreground">
                  {new Date(order?.createdAt ?? "").toLocaleDateString()}
                </div>
              </div>
              <div className="flex flex-col md:flex-row  md:items-center gap-2">
                <Badge
                  variant={getStatusBadgeVariant(order?.status ?? "PENDING")}
                >
                  {order?.status}
                </Badge>
                {order?.trackingNumber && (
                  <span className="text-sm text-muted-foreground">
                    Tracking: {order?.trackingNumber}
                  </span>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
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
                  {order?.items?.map((item) => (
                    <TableRow key={item._id}>
                      <TableCell>
                        <Avatar className="h-12 w-12 rounded-md">
                          <AvatarImage
                            src={
                              item?.product?.image ||
                              "/placeholder.svg?height=50&width=50&query=product image"
                            }
                            alt={item?.product?.title}
                          />
                          <AvatarFallback>
                            {item?.product?.title?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      </TableCell>
                      <TableCell className="font-medium">
                        {item?.product?.title}
                      </TableCell>
                      <TableCell className="text-center">
                        {item.quantity}
                      </TableCell>
                      <TableCell className="text-right">
                        {displayMoney(item?.product?.price ?? 0, false)}
                      </TableCell>
                      <TableCell className="text-right">
                        {displayMoney(
                          item?.quantity * (item?.product?.price ?? 0),
                          false
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <PaymentDetailCard payment={order?.payment} />
              {/* {order?.deliveryCharge && ( */}
              <div className="mt-4 flex justify-between items-center">
                <div className="text-sm">
                  Delivery Charge: {displayMoney(order?.deliveryCharge ?? 0)}
                </div>
              </div>
              {/* )} */}
              <div className="mt-4 flex justify-between items-center">
                <div className="text-lg font-semibold">
                  Total: {displayMoney(order?.total ?? 0)}
                </div>
                {canCancel && (
                  <Button
                    variant="destructive"
                    disabled={isPending}
                    loading={isPending}
                    onClick={() => setOpen(true)}
                  >
                    Cancel order
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </Container>
      {open && (
        <AlertDialog open={open} onOpenChange={setOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently cancel your
                order
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleCancelOrder}>
                Continue
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}

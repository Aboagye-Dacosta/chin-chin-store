"use client";

import { Badge } from "../ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";

interface PaymentStatusBadgeProps {
  status: "PENDING" | "PAID" | "FAILED" | "REFUNDED" | "AWAITING_CONFIRMATION";
  paymentId: Id<"payments">;
}

export const PaymentStatusBadge = ({
  status,
  paymentId,
}: PaymentStatusBadgeProps) => {
  const variant: Record<string, "pending" | "default" | "destructive" | "processing"> = {
    PENDING: "pending",
    PAID: "default",
    FAILED: "destructive",
    REFUNDED: "destructive",
    AWAITING_CONFIRMATION: "processing",
  };

  const updatePayment = useMutation(api.payments.updatePayment.updateStatus);

  const handleUpdatePayment = (value: string) => {
    try {
      updatePayment({
        paymentId: paymentId,
        status: value as PaymentStatusBadgeProps["status"],
      });
      toast.success("Payment status updated successfully");
    } catch  {
      toast.error("Could not update payment status");
    }
  };

  return (
    <Select
      value={status}
      onValueChange={(value) => handleUpdatePayment(value)}
    >
      <SelectTrigger className="border-none shadow-none p-0">
        <Badge variant={variant[status]}>
          <SelectValue placeholder="Select a status" />
        </Badge>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="PENDING">Pending</SelectItem>
        <SelectItem value="PAID">Paid</SelectItem>
        <SelectItem value="FAILED">Failed</SelectItem>
        <SelectItem value="REFUNDED">Refunded</SelectItem>
        <SelectItem value="AWAITING_CONFIRMATION">
          Awaiting Confirmation
        </SelectItem>
      </SelectContent>
    </Select>
  );
};

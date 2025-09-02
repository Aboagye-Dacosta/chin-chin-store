import { ORDER_STATUSES } from "@/constants/order-statuses";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Badge } from "@/components/ui/badge";
import { handleStatus } from "@/lib/handle-status";

interface StatusUpdateSelectProps {
  initialValue: "PENDING" | "CANCELLED" | "PROCESSING" | "DELIVERED";
  id: Id<"orders">;
}

export const StatusUpdateSelect = ({
  initialValue,
  id,
}: StatusUpdateSelectProps) => {
  const updateOrderStatus = useMutation(api.orders.updateStatus);

  const handleStatusChange = (
    status: "PENDING" | "CANCELLED" | "PROCESSING" | "DELIVERED"
  ) => {
    try {
      updateOrderStatus({ orderId: id, status });
      handleStatus({
        message: "Order status updated successfully",
        success: true,
      });
    } catch (error) {
      handleStatus({ error });
    }
  };

  return (
    <Select value={initialValue} onValueChange={handleStatusChange}>
      <SelectTrigger className="w-full">
        <Badge
          //@ts-expect-error i expected this error
          variant={
            initialValue == "CANCELLED"
              ? "destructive"
              : initialValue.toLowerCase()
          }
        >
          <SelectValue placeholder="Select a status" />
        </Badge>
      </SelectTrigger>
      <SelectContent>
        {ORDER_STATUSES.map((status) => (
          <SelectItem key={status} value={status}>
            {status}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

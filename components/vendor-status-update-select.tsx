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
  initialValue?: "ACTIVE" | "INACTIVE";
  id: Id<"vendors">;
}

export const VendorStatusUpdateSelect = ({
  initialValue,
  id,
}: StatusUpdateSelectProps) => {
  const updateOrderStatus = useMutation(api.vendors.updateVendorStatus);

  const handleStatusChange = async (status: "ACTIVE" | "INACTIVE") => {
    try {
      await updateOrderStatus({ vendorId: id, status });
      handleStatus({
        message: "Vendor status updated successfully",
        success: true,
      });
    } catch (error) {
      handleStatus({ error });
    }
  };

  return (
    <Select value={initialValue} onValueChange={handleStatusChange}>
      <SelectTrigger className="w-full">
        <Badge variant={initialValue == "ACTIVE" ? "delivered" : "destructive"}>
          <SelectValue placeholder="Select a status" />
        </Badge>
      </SelectTrigger>
      <SelectContent>
        {["ACTIVE", "INACTIVE"].map((status) => (
          <SelectItem key={status} value={status}>
            {status}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

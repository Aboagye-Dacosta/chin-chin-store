import { SelectItem } from "@/components/ui/select";
import { Vendor } from "@/types/convex-types";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function VendorSelectOptions({ vendor }: Readonly<{ vendor: Vendor }>) {
  const user = useQuery(api.users.getUser, { userId: vendor.userId });

  return (
    <SelectItem key={vendor._id} value={vendor._id}>
      {user?.name}
    </SelectItem>
  );
}

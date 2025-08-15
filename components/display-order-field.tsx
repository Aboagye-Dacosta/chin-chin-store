import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Vendor } from "@/types/convex-types";

export const DisplayOrderCount = ({
  vendorId,
}: {
  vendorId: Vendor["_id"];
}) => {
  const orders = useQuery(api.orders.getOrdersByVendor, { vendorId });
  return <>{orders?.length ?? 0}</>;
};

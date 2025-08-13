import { Store } from "@/types/convex-types";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export const DisplayVendorsCount = ({ id }: { id: Store["_id"] }) => {
  const vendors = useQuery(api.vendors.getVendors, { storeId: id });
  return <>{vendors?.length ?? 0}</>;
};

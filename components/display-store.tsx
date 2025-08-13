import { Store } from "@/types/convex-types";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export const DisplayStore = ({ id }: { id: Store["_id"] }) => {
  const stores = useQuery(api.stores.getStores);
  const store = stores?.find((store) => store._id === id);
  return <>{store?.name}</>;
};

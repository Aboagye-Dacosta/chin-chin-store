import {  Store } from "@/types/convex-types";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { displayMoney } from "@/lib/display-money";

export const DisplayDeliveryCharge = ({ id }: { id: Store["_id"] }) => {
  const deliveryCharges = useQuery(api.deliveryCharge.getAllDeliveryCharges);
  const deliveryCharge = deliveryCharges?.find((charge) => charge.storeId === id);
  return <>{displayMoney(deliveryCharge?.amount ?? 0,false)}</>;
};

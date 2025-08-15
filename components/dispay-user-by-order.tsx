"use client";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Order } from "@/types/convex-types";
import { DisplayUserField } from "./display-user-field";

export const DisplayUserByOrder = ({ orderId }: { orderId: Order["_id"] }) => {
  const order = useQuery(api.orders.getOrderById, { orderId });
  return <DisplayUserField userId={order?.userId!} field="name" />;
};

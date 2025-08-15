"use client";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Order } from "@/types/convex-types";
import { DisplayStore } from "./display-store";

export const DisplayStoreByOrder = ({ orderId }: { orderId: Order["_id"] }) => {
    const order = useQuery(api.orders.getOrderById, { orderId });
    return <>{DisplayStore({ id: order?.storeId! })}</>;
};
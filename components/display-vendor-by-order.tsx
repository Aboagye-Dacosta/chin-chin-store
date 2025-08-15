"use client"
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Order } from "@/types/convex-types";
import { DisplayUserField } from "./display-user-field";

export const DisplayVendorByOrder = ({ orderId }: { orderId: Order["_id"] }) => {
    const order = useQuery(api.orders.getOrderById, { orderId });
    const vendor = useQuery(api.vendors.getVendorById, { vendorId: order?.vendorId! });
    return <>{DisplayUserField({ userId: vendor?.userId!, field: "name" })}</>;
};
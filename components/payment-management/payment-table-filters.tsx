
"use client";
import { Order } from "@/types/convex-types";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export const PaymentTableFilters = ({ orderId }: { orderId: Order["_id"] }) => {
    const order = useQuery(api.orders.getOrderById, { orderId });
    const vendors = useQuery(api.vendors.getAllVendors);
    const stores = useQuery(api.stores.getStores);

    const paymentStore = stores?.find((store) => store._id === order?.storeId);
    const paymentVendor = vendors?.find((vendor) => vendor._id === order?.vendorId);
    return (
        <div>hello</div>
    )
};
import { Vendors } from "@/lib/fetch/fetch-vendors";
import { Column } from "../DataTable";
import { getFormattedTime } from "@/lib/getFormattedTime";

export const VendorColumns:Column<Vendors[number]>[] = [
    {
        key: "name",
        header: "Name",
        render: (_v, row) => row.name,
    },
    {
        key: "email",
        header: "Email",
        render: (_v, row) => row.email,
    },
    {
        key: "store",
        header: "Store",
        render: (_v,row) => row.store?.name,
    },
    {
        key: "receivedOrders",
        header: "Received Orders",
        render: (_v,row) => row.receivedOrders?.length,
    },
    {
        key: "createdAt",
        header: "Created At",
        render: (_v,row) => getFormattedTime(row.createdAt.toString()),
    },
];

    
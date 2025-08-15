import { Column } from "../DataTable";
import { getFormattedTime } from "@/lib/getFormattedTime";
import { Vendor } from "@/types/convex-types";
import { DisplayStore } from "../display-store";
import { DisplayOrderCount } from "../display-order-field";
import { DisplayUserField } from "../display-user-field";

interface TableVendor extends Vendor {
  store?: string;
  receivedOrders?: number;
  name?: string;
  email?: string;
}

export const VendorColumns: Column<TableVendor>[] = [
  {
    key: "name",
    header: "Name",
    render: (_v, row) => <DisplayUserField userId={row.userId} field="name" />,
  },
  {
    key: "email",
    header: "Email",
    render: (_v, row) => <DisplayUserField userId={row.userId} field="email" />,
  },
  {
    key: "store",
    header: "Store",
    render: (_v, row) => <DisplayStore id={row.storeId} />,
  },
  {
    key: "receivedOrders",
    header: "Received Orders",
    render: (_v, row) => <DisplayOrderCount vendorId={row._id} />,
  },
  {
    key: "createdAt",
    header: "Created At",
    render: (_v, row) => getFormattedTime(row.createdAt.toString()),
  },
];

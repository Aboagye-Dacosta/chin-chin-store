import { Column } from "../DataTable";
import { getFormattedTime } from "@/lib/getFormattedTime";
import { Vendor } from "@/types/convex-types";
import { DisplayStore } from "../display-store";
import { DisplayOrderCount } from "../display-order-field";
import { DisplayUserField } from "../display-user-field";
import { VendorTableActions } from "./vendor-table-actions";
import { VendorStatusUpdateSelect } from "../vendor-status-update-select";

interface TableVendor extends Vendor {
  store?: string;
  receivedOrders?: number;
  name?: string;
  email?: string;
  phoneNumber?: string;
  provider?: string;
  actions?: string;
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
    key: "phoneNumber",
    header: "Phone",
    render: (_v, row) => row.mobileMoney.phoneNumber,
  },
  {
    key: "provider",
    header: "Provider",
    render: (_v, row) => row.mobileMoney.provider,
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
    key: "status",
    header: "Status",
    render: (_v, row) => (
      <VendorStatusUpdateSelect id={row._id} initialValue={row.status} />
    ),
  },
  {
    key: "createdAt",
    header: "Created At",
    render: (_v, row) => getFormattedTime(row.createdAt.toString()),
  },
  {
    key: "actions",
    header: "",
    render: (_v, row) => <VendorTableActions vendor={row} />,
  },
];

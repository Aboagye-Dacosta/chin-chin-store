import { OrderWithUserAndStore } from "@/types/convex-types";
import { Column } from "../DataTable";
import { getFormattedTime } from "@/lib/getFormattedTime";
import { StatusUpdateSelect } from "../status-update-select";
import { displayMoney } from "@/lib/display-money";

export const OrderColumns: Column<OrderWithUserAndStore>[] = [
  {
    key: "storeId",
    header: "Store",
    render: (_value, row) => row.store?.name,
  },
  {
    key: "vendorId",
    header: "Vendor",
    render: (_value, row) => row.vendor?.name,
  },
  {
    key: "userId",
    header: "User",
    render: (_value, row) => row.user?.name,
  },
  {
    key: "status",
    header: "Status",
    render: (_value, row) => (
      <StatusUpdateSelect initialValue={row.status} id={row._id} />
    ),
  },
  {
    key: "total",
    header: "Total Amount",
    render: (_value, row) => displayMoney(row.total, false),
  },
  {
    key: "createdAt",
    header: "Created At",
    render: (_value, row) => getFormattedTime(row.createdAt),
  },
];

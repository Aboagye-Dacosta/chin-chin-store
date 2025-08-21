import { OrderWithUserAndStore } from "@/types/convex-types";
import { Column } from "../DataTable";


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
    render: (_value, row) => row.status,
  },
  {
    key: "total",
    header: "Total Amount",
    render: (_value, row) => row.total,
  },
  {
    key: "createdAt",
    header: "Created At",
    render: (_value, row) => row.createdAt,
  },
];

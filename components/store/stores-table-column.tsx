import { Column } from "../DataTable";
import { getFormattedTime } from "@/lib/getFormattedTime";
import { StoreWithLocation } from "@/types/convex-types";
import { StoreTableActions } from "./store-table-actions";
import { displayMoney } from "@/lib/display-money";

interface StoreCount extends StoreWithLocation {
  products?: number;
  actions?: string;
}

export const StoreColumns: Column<StoreCount>[] = [
  {
    key: "name",
    header: "Name",
  },
  {
    key: "locationId",
    header: "Location",
    render: (_v, row) => row.location?.name,
  },
  {
    key: "products",
    header: "Products",
    render: (_v, row) => row.productCount,
  },
  {
    key: "vendors",
    header: "Vendors",
    render: (_v, row) => row.vendors?.length ?? 0,
  },
  {
    key: "deliveryCharge",
    header: "Delivery Charge",
    render: (_v, row) => displayMoney(row.deliveryCharge, false),
  },
  {
    key: "createdAt",
    header: "Created At",
    render: (_v, row) =>
      getFormattedTime(new Date(row.createdAt).toISOString()),
  },
  {
    key: "actions",
    header: "",
    render: (_v, row) => <StoreTableActions store={row} />,
  },
];

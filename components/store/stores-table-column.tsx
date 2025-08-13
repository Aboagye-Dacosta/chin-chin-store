import { Column } from "../DataTable";
import { getFormattedTime } from "@/lib/getFormattedTime";
import { DisplayLocation } from "../display-location";
import { Store } from "@/types/convex-types";
import { DisplayProductCount } from "../display-product-count";
import { DisplayVendorsCount } from "../display-vendors-count";
import { DisplayDeliveryCharge } from "../display-delivery-charge";
import { StoreTableActions } from "./store-table-actions";

interface StoreCount extends Store {
  products?: number;
  vendors?: number;
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
    render: (_v, row) => <DisplayLocation id={row.locationId} />,
  },
  {
    key: "products",
    header: "Products",
    render: (_v, row) => <DisplayProductCount id={row._id} />,
  },
  {
    key: "vendors",
    header: "Vendors",
    render: (_v, row) => <DisplayVendorsCount id={row._id} />,
  },
  {
    key: "deliveryChargeId",
    header: "Delivery Charge",
    render: (_v, row) => <DisplayDeliveryCharge id={row._id} />,
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

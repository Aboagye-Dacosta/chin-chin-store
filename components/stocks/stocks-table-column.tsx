import { ProductByStore } from "@/types/convex-types";
import { Column } from "../DataTable";
import Image from "next/image";
import { StocksTableActions } from "./stocks-table-actions";

export type StockTableProps = ProductByStore & {
  store?: string;
  category?: string;
  image?: string;
  actions?: string;
};

export const StocksTableColumns: Column<StockTableProps>[] = [
  {
    key: "image",
    header: "",
    render: (_value, row) => (
      <div className="flex items-center h-[50px] w-[50px]">
        <Image
          src={row.product?.image ?? "/placeholder.png"}
          alt={row.product?.title ?? ""}
          width={20}
          height={20}
          className="object-contain"  
        />
      </div>
    ),
  },
  {
    key: "product",
    header: "Title",
    render: (_value, row) => row.product?.title,
  },
  {
    key: "quantity",
    header: "Quantity",
    render: (_value, row) => row.quantity,
  },
  {
    key: "store",
    header: "Store",
    render: (_value, row) => row.store?.name,
  },
  {
    key: "category",
    header: "Category",
    render: (_value, row) => row.category?.name,
  },
  {
    key: "actions",
    header: "Actions",
    render: (_value, row) => <StocksTableActions stock={row} />,
  },
];

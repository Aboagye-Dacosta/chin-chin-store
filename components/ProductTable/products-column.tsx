import { Column } from "../DataTable";
import { getFormattedTime } from "@/lib/getFormattedTime";
import { displayMoney } from "@/lib/display-money";
import Image from "next/image";
import { ProductsTableActions } from "./products-table-actions";
import { ProductWithStoreAndCategory } from "@/types/convex-types";

export const productsColumn: Column<ProductWithStoreAndCategory>[] = [
  {
    key: "image",
    header: "",
    render: (_value, row) => (
      <div className="w-16 h-16">
        <Image
          src={row.image ? row.image : "/placeholder.png"}
          alt={row.title}
          width={100}
          height={100}
          className="w-16 h-16 object-cover"
        />
      </div>
    ),
  },
  {
    key: "title",
    header: "Title",
  },
  {
    key: "price",
    header: "Price",
    render: (_value, row) => `${displayMoney(row.price, false)}`,
  },
  {
    key: "categoryId",
    header: "Category",
    render: (_value, row) => row.category?.name,
  },
  {
    key: "storeId",
    header: "Store",
    render: (_value, row) => row.store?.name,
  },
  {
    key: "packaging",
    header: "Packaging",
    render: (_value, row) => row.packaging,
  },
  {
    key: "createdAt",
    header: "Created At",
    render: (_value, row) =>
      getFormattedTime(new Date(row.createdAt).toISOString()),
  },
  {
    key: "updatedAt",
    header: "Updated At",
    render: (_value, row) =>
      getFormattedTime(new Date(row.updatedAt).toISOString()),
  },
  {
    key: "_id",
    header: "",
    render: (_value, row) => <ProductsTableActions row={row} />,
  },
];

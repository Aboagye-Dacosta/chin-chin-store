import { displayMoney } from "@/lib/display-money";
import { getFormattedTime } from "@/lib/getFormattedTime";
import { ProductWithCategory } from "@/types/convex-types";
import Image from "next/image";
import { Column } from "../DataTable";
import { ProductsTableActions } from "./products-table-actions";

export const productsColumn: Column<Omit<ProductWithCategory, "stock">>[] = [
  {
    key: "image",
    header: "",
    render: (_value, row) => (
      <div className="w-[50px] h-[50px] flex items-center justify-center">
        <Image
          src={row.image ? row.image : "/placeholder.png"}
          alt={row.title}
          width={20}
          height={20}
          className=" object-cover"
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

import { ProductWithCategory } from "@/types/convex-types";
import { memo } from "react";
import { DataTable } from "../DataTable";
import { productsColumn } from "./products-column";

export type ProductRow = Omit<
  ProductWithCategory,
  "stock" | "image" | "model"
> & {
  image?: string | null;
  model?: string | null;
};

export const ProductsTable = memo(
  ({
    products,
    filterBy,
    onRowSelect,
  }: {
    products: ProductRow[];
    filterBy: Record<string, string>;
    onRowSelect?: (selectdRows: Set<string>) => void;
  }) => {
    return (
      <DataTable
        data={products as unknown as Omit<ProductWithCategory, "stock">[]}
        columns={productsColumn}
        filterBy={filterBy}
        showCheckboxes
        onRowSelect={onRowSelect}
        className="w-full"
      />
    );
  }
);

ProductsTable.displayName = "ProductsTable";

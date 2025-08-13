import { DataTable } from "../DataTable";
import { Product } from "@/types/convex-types";
import { productsColumn } from "./products-column";
import { memo } from "react";

export const ProductsTable = memo(({
  products,
  filterBy,
  onRowSelect,
}: {
  products: Product[];
  filterBy: Record<string, string>;
  onRowSelect?: (selectdRows: Set<string>) => void;
}) => {
  return (
    <DataTable
      data={products}
      columns={productsColumn}
      filterBy={filterBy}
      showCheckboxes
      onRowSelect={onRowSelect}
      className="w-full"
    />
  );
});

ProductsTable.displayName = "ProductsTable";


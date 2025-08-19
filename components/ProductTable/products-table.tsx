import { DataTable } from "../DataTable";
import { ProductWithStoreAndCategory } from "@/types/convex-types";
import { productsColumn } from "./products-column";
import { memo } from "react";

export const ProductsTable = memo(({
  products,
  filterBy,
  onRowSelect,
}: {
  products: ProductWithStoreAndCategory[];
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


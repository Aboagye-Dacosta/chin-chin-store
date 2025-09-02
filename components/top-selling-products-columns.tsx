"use client";

import { ColumnDef } from "@tanstack/react-table";

export type TopSellingProduct = {
  _id: string;
  title: string;
  category: string;
  totalSold: number;
  totalRevenue: number;
};

export const columns: ColumnDef<TopSellingProduct>[] = [
  {
    accessorKey: "title",
    header: "Product",
  },
  {
    accessorKey: "category",
    header: "Category",
  },
  {
    accessorKey: "totalSold",
    header: "Total Sold",
  },
  {
    accessorKey: "totalRevenue",
    header: "Total Revenue",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("totalRevenue"));
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "GHS",
      }).format(amount);

      return <div className="text-left font-medium">{formatted}</div>;
    },
  },
];

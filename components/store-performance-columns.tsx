"use client";

import { ColumnDef } from "@tanstack/react-table";

export type StorePerformance = {
  _id: string;
  name: string;
  location: string;
  totalRevenue: number;
  totalOrders: number;
};

export const columns: ColumnDef<StorePerformance>[] = [
  {
    accessorKey: "name",
    header: "Store",
  },
  {
    accessorKey: "location",
    header: "Location",
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
  {
    accessorKey: "totalOrders",
    header: "Total Orders",
  },
];

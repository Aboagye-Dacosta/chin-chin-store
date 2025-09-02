import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTableHeaderProps } from "./DataTable.types";
import { cn } from "@/lib/utils";

export function DataTableHeader<T extends Record<string, unknown>>({
  columns,
  showCheckboxes,
  selectAll,
  onSelectAll,
  row,
}: Readonly<DataTableHeaderProps<T>>) {
  return (
    <thead>
      <tr className="border-b ">
        {showCheckboxes && (
          <th className="text-left py-3 px-4 font-medium text-gray-700 w-12">
            <Checkbox
              checked={selectAll}
              onCheckedChange={(e: boolean) => onSelectAll(e)}
              aria-label="Select all rows"
            />
          </th>
        )}
        {columns.map((column) => (
          <th
            key={String(column.key)}
            className={cn(
              "text-left py-3 px-4 font-medium whitespace-nowrap text-accent-950",
              column?.condition === undefined || column?.condition?.(row)
                ? ""
                : "hidden"
            )}
          >
            {column.header}
          </th>
        ))}
      </tr>
    </thead>
  );
}

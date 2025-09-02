import React from "react";
import { Checkbox } from "../ui/checkbox";
import { formatCellValue } from "./DataTable.utils";
import { DataTableRowProps } from "./DataTable.types";
import { cn } from "@/lib/utils";

export function DataTableRow<T extends Record<string, unknown>>({
  row,
  index,
  columns,
  showCheckboxes,
  isSelected,
  rowId,
  onRowSelect,
}: Readonly<DataTableRowProps<T>>) {
  return (
    <tr
      key={rowId}
      className="border-b hover:bg-accent transition-colors"
    >
      {showCheckboxes && (
        <td className="py-3 px-4">
          <Checkbox
            checked={isSelected}
            onCheckedChange={(e: boolean) => onRowSelect(rowId, e)}
            aria-label={`Select row ${index + 1}`}
          />
        </td>
      )}
      {columns.map((column) => (
        <td
          key={String(column.key)}
          className={cn(
            "py-3 px-4 text-accent-800 whitespace-nowrap !capitalize",
            column?.condition === undefined || column?.condition?.(row)
              ? ""
              : "hidden"
          )}
        >
          {column.render
            ? column.render(row[column.key], row)
            : formatCellValue(row[column.key])
              ? formatCellValue(row[column.key])
              : "Unavailable"}
        </td>
      ))}
    </tr>
  );
}

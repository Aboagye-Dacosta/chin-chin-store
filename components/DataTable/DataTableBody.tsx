import React from "react";
import { DataTableRow } from "./DataTableRow";
import { DataTableBodyProps } from "./DataTable.types";

export function DataTableBody<T extends Record<string, unknown>>({
  data,
  columns,
  showCheckboxes,
  selectedRows,
  getRowId,
  onRowSelect,
}: Readonly<DataTableBodyProps<T>>) {
  return (
    <tbody>
      {data.map((row, index) => {
        const rowId = getRowId(row, index);
        const isSelected = selectedRows.has(rowId);

        return (
          <DataTableRow
            key={rowId}
            row={row}
            index={index}
            columns={columns}
            showCheckboxes={showCheckboxes}
            isSelected={isSelected}
            rowId={rowId}
            onRowSelect={onRowSelect}
          />
        );
      })}
    </tbody>
  );
}

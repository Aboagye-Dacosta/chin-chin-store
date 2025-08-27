"use client";

import React, { useEffect } from "react";
import { DataTableProps } from "./DataTable.types";
import { useDataTableFiltering } from "@/hooks/useDataTableFiltering";
import { useDataTableSelection } from "@/hooks/useDataTableSelection";
import { DataTableHeader } from "./DataTableHeader";
import { DataTableBody } from "./DataTableBody";
import { EmptyState } from "../EmptyState";
import { cn } from "@/lib/utils";
import { DataTableLoadingSkeleton } from "../DataTableLoadingSkeleton";
import { ErrorCard } from "../ErrorCard";
import { ScrollableCard } from "../ScrollableCard";

export function DataTable<T extends Record<string, unknown>>({
  data,
  columns,
  showCheckboxes = false,
  searchTerm = "",
  onRowSelect,
  className = "",
  emptyMessage = "No data found",
  filterBy,
  loading = false,
  hasError = false,
  refresh,
}: Readonly<DataTableProps<T>>) {
  const filteredData = useDataTableFiltering(data, searchTerm, filterBy);

  const {
    selectedRows,
    selectAll,
    getRowId,
    handleSelectAll,
    handleRowSelect,
  } = useDataTableSelection(filteredData);

  useEffect(() => {
    onRowSelect?.(selectedRows);
  }, [selectedRows, onRowSelect]);

  if (loading) {
    return (
      <DataTableLoadingSkeleton
        showCheckboxes={showCheckboxes}
        columns={columns.length}
        rows={6}
      />
    );
  }

  return (
    <ScrollableCard className="p-0 shadow-none border-none" maxHeight="400px">
      <div className={cn("w-full flex flex-col h-full", className)}>
        <table className="w-full">
          <DataTableHeader
            columns={columns}
            showCheckboxes={showCheckboxes}
            selectAll={selectAll}
            onSelectAll={handleSelectAll}
            row={data?.[0]}
          />
          {!hasError && (
            <DataTableBody
              data={filteredData}
              columns={columns}
              showCheckboxes={showCheckboxes}
              selectedRows={selectedRows}
              getRowId={getRowId}
              onRowSelect={handleRowSelect}
            />
          )}
        </table>
        {filteredData.length === 0 && !hasError && (
          <div className="flex flex-1 items-center justify-center">
            <EmptyState message={emptyMessage} searchTerm={searchTerm} />
          </div>
        )}
        {hasError && (
          <div className="flex flex-1 items-center justify-center my-32">
            <ErrorCard onRetry={refresh} />
          </div>
        )}
      </div>
    </ScrollableCard>
  );
}

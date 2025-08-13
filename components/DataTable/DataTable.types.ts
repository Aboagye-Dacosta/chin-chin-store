import React from "react";

export interface Column<T> {
  key: keyof T;
  header: string;
  render?: (value: unknown, row: T) => React.ReactNode;
}

export interface DataTableHeaderProps<T> {
  columns: Column<T>[];
  showCheckboxes: boolean;
  selectAll: boolean;
  onSelectAll: (checked: boolean) => void;
}

export interface DataTableRowProps<T> {
  row: T;
  index: number;
  columns: Column<T>[];
  showCheckboxes: boolean;
  isSelected: boolean;
  rowId: string;
  onRowSelect: (rowId: string, checked: boolean) => void;
}

export interface DataTableBodyProps<T> {
  data: T[];
  columns: Column<T>[];
  showCheckboxes: boolean;
  selectedRows: Set<string>;
  getRowId: (row: T, index: number) => string;
  onRowSelect: (rowId: string, checked: boolean) => void;
}

export interface DataTableProps<T extends Record<string, unknown>> {
  data: T[];
  columns: Column<T>[];
  showCheckboxes?: boolean;
  searchTerm?: string;
  onRowSelect?: (selectedRows: Set<string>) => void;
  className?: string;
  emptyMessage?: string;
  filterBy?: Record<string, string>;
  loading?: boolean;
  hasError?: boolean;
  refresh?: () => void;
}

export type RowWithOptionalId<T> = T & { id?: string | number };

export interface EmptyStateProps {
  message: string;
  searchTerm?: string;
}

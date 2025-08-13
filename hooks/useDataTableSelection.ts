import { useState, useCallback, useMemo, useEffect } from "react";

type RowWithOptionalId<T> = T & { id?: string | number };

export function useDataTableSelection<T extends Record<string, unknown>>(
  filteredData: T[],
) {
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);

  const getRowId = useCallback((row: T, index: number): string => {
    const rowWithId = row as RowWithOptionalId<T>;
    return rowWithId.id ? String(rowWithId.id) : String(index);
  }, []);

  const filteredRowIds = useMemo(
    () => filteredData.map((row, index) => getRowId(row, index)),
    [filteredData, getRowId],
  );

  const isAllSelected = useMemo(() => {
    if (filteredRowIds.length === 0) return false;
    return filteredRowIds.every((id) => selectedRows.has(id));
  }, [filteredRowIds, selectedRows]);

  useEffect(() => {
    setSelectAll(isAllSelected);
  }, [isAllSelected]);

  const handleSelectAll = useCallback(
    (checked: boolean) => {
      setSelectAll(checked);

      if (checked) {
        const allIds = new Set(filteredRowIds);
        setSelectedRows(allIds);
      } else {
        setSelectedRows(new Set());
      }
    },
    [filteredData, filteredRowIds],
  );

  const handleRowSelect = useCallback(
    (rowId: string, checked: boolean) => {
      setSelectedRows((prev) => {
        const newSelectedRows = new Set(prev);

        if (checked) {
          newSelectedRows.add(rowId);
        } else {
          newSelectedRows.delete(rowId);
          setSelectAll(false);
        }

        return newSelectedRows;
      });
    },
    [filteredRowIds],
  );

  return {
    selectedRows,
    selectAll,
    getRowId,
    handleSelectAll,
    handleRowSelect,
  };
}

import { useMemo, useCallback } from "react";
import { z } from "zod";

const dateTimeSchema = z.string().datetime();

export function useDataTableFiltering<T extends Record<string, unknown>>(
  data: T[],
  searchTerm: string,
  filterBy?: Record<string, string>,
) {
  const compareDates = useCallback(
    (rowValue: unknown, filterValue: string): boolean => {
      try {
        const rowDate = new Date(rowValue as string)
          .toISOString()
          .split("T")[0];
        const filterDate = new Date(filterValue).toISOString().split("T")[0];
        return rowDate === filterDate;
      } catch {
        return false;
      }
    },
    [],
  );

  const filteredData = useMemo(() => {
    let result = data;

    if (filterBy && Object.keys(filterBy).length > 0) {
      result = result.filter((row) => {
        return Object.entries(filterBy).every(([key, value]) => {
          if (!value || value === "all") return true;

          const rowValue = row[key as keyof T];

          if (dateTimeSchema.safeParse(value).success) {
            return compareDates(rowValue, value);
          }

          if (typeof rowValue === "object") {
            return Object.values(rowValue as Record<string, unknown>).some((rowValue) => rowValue === value);
          }


          return String(rowValue) === String(value);
        });
      });
    }

    if (searchTerm?.trim()) {
      const normalizedSearch = searchTerm.trim().toLowerCase();
      result = result.filter((row) => {
        return Object.values(row).some((value) =>
          String(value).toLowerCase().includes(normalizedSearch),
        );
      });
    }

    return result;
  }, [data, filterBy, searchTerm, compareDates]);

  return filteredData;
}

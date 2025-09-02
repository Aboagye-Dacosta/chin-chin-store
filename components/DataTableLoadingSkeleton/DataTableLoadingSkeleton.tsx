import { useMemo } from "react";
import { nanoid } from "nanoid";
import { DataTableLoadingSkeletonProps } from "./DataTableLoadingSkeleton.types";
import { Skeleton } from "@/components/ui/skeleton";

export const DataTableLoadingSkeleton = ({
  columns = 4,
  rows = 6,
  showCheckboxes = false,
}: Readonly<DataTableLoadingSkeletonProps>) => {
  const columnIds = useMemo(
    () => Array.from({ length: columns }, () => nanoid()),
    [columns]
  );

  const rowIds = useMemo(
    () => Array.from({ length: rows }, () => nanoid()),
    [rows]
  );

  return (
    <div className="overflow-x-auto w-full flex flex-col h-full">
      <table className="w-full">
        <thead>
          <tr className="border-b border-neutral-200">
            {showCheckboxes && (
              <th className="py-3 px-4 w-12">
                <Skeleton className="h-24 w-24 rounded" />
              </th>
            )}
            {columnIds.map((id) => (
              <th key={id} className="py-3 px-4">
                <Skeleton className="h-24 w-48 rounded" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rowIds.map((rowId) => (
            <tr key={rowId} className="border-b border-neutral-100">
              {showCheckboxes && (
                <td className="py-3 px-4">
                  <Skeleton className="h-24 w-24 rounded" />
                </td>
              )}
              {columnIds.map((colId) => (
                <td key={colId} className="py-3 px-4">
                  <Skeleton
                    className="h-24 w-full rounded"
                    style={{ minWidth: 60 }}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

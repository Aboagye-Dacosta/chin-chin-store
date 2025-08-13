"use client";

import { Badge } from "./ui/badge";
import { memo } from "react";
import { LoadingSpinner } from "./ui/loading-spinner";

export const CartBadge = memo(
  ({ isLoading, count }: { isLoading: boolean; count: number  }) => {
    if (isLoading) {
      return (
        <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
          <LoadingSpinner className="h-4 w-4" />
        </Badge>
      );
    }

    if (count > 0) {
      return (
        <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
          {count}
        </Badge>
      );
    }

    return null;
  }
);

CartBadge.displayName = "CartBadge";

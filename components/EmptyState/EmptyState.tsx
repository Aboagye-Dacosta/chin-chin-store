import React from "react";
import { Flex } from "@/components/ui/flex";
import { IconEmpty } from "@/components/ui/IconEmpty";

interface EmptyStateProps {
  message: string;
  searchTerm?: string;
}

export function EmptyState({ message, searchTerm }: Readonly<EmptyStateProps>) {
  return (
    <Flex
      direction="col"
      align="center"
      justify="center"
      gap={"lg"}
      className="h-max w-full py-8"
    >
      <IconEmpty />
      <Flex direction="col" justify="center" align="center" gap={"sm"}>
        <p className="text-body-lg font-normal text-neutral-800">{message}</p>
        {searchTerm && (
          <p className="text-body-sm font-normal text-neutral-800">
            Try adjusting your search term
          </p>
        )}
      </Flex>
    </Flex>
  );
}

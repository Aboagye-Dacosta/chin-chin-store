"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { Vendors } from "@/lib/fetch/fetch-vendors";
import { Flex } from "../ui/flex";
import { CardHeaderFilters } from "../card-header-with-filters";
import { DataTable } from "../DataTable";
import { VendorColumns } from "./vendor-table-columns";
import { Store } from "@/lib/fetch/fetch-stores";

export function VendorManagement({
  vendors,
  stores,
}: Readonly<{
  vendors: Vendors;
  stores: Store;
}>) {
  const [filter, setFilter] = useState<Record<string, string>>({});

  return (
    <Flex direction="col" gap="lg" className="w-full">
      <Flex direction="row" justify="between" align="center" className="w-full">
        <h1 className="text-3xl font-bold">Vendor Management</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Vendor
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Vendor</DialogTitle>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </Flex>
      <Card className="w-full ">
        <CardHeaderFilters
          title="Vendors"
          filters={[
            {
              key: "store",
              label: "Store",
              options: stores.map((store) => ({
                label: store.name,
                value: store.id,
              })),
            },
          ]}
          onFilterChange={(filter) => setFilter(filter)}
        />
        <CardContent>
          <DataTable data={vendors} columns={VendorColumns} filterBy={filter} />
        </CardContent>
      </Card>
    </Flex>
  );
}

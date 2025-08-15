"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { Flex } from "../ui/flex";
import { CardHeaderFilters } from "../card-header-with-filters";
import { DataTable } from "../DataTable";
import { VendorColumns } from "./vendor-table-columns";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { CreateVendorForm } from "./vendor-form";

export function VendorManagement() {
  const [filter, setFilter] = useState<Record<string, string>>({});
  const vendors = useQuery(api.vendors.getAllVendors);
  const stores = useQuery(api.stores.getStores);

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
          <DialogContent className="!max-w-[700px] w-full">
            <CreateVendorForm />
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
              options:
                stores?.map((store) => ({
                  label: store.name,
                  value: store._id,
                })) ?? [],
            },
          ]}
          onFilterChange={(filter) => setFilter(filter)}
        />
        <CardContent>
          <DataTable
            data={vendors ?? []}
            columns={VendorColumns}
            filterBy={filter}
          />
        </CardContent>
      </Card>
    </Flex>
  );
}

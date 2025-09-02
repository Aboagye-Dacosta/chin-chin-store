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
import { Plus, Menu } from "lucide-react";
import { Flex } from "../ui/flex";
import { CardHeaderFilters } from "../card-header-with-filters";
import { DataTable } from "../DataTable";
import { StoreColumns } from "./stores-table-column";
import LocationForm from "./location-form";
import { Separator } from "../ui/separator";
import { ScrollableCard } from "../ScrollableCard";
import StoreForm from "./store-form";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";
import { LocationCard } from "./location-card";

export function StoreManagement() {
  const [filter, setFilter] = useState<Record<string, string>>({});
  const [showMenu, setShowMenu] = useState(false);
  const locations = useQuery(api.locations.getLocations);
  const stores = useQuery(api.stores.getStores);

  return (
    <Flex direction="col" gap="lg" className="w-full p-7">
      <Flex direction="row" justify="between" align="center" className="w-full">
        <h1 className="text-3xl font-bold">Store Management</h1>
        <Dialog>
          <Flex gap="md">
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Store
              </Button>
            </DialogTrigger>
            <Button variant="ghost" onClick={() => setShowMenu(!showMenu)}>
              <Menu />
            </Button>
          </Flex>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Store</DialogTitle>
            </DialogHeader>
            <StoreForm />
          </DialogContent>
        </Dialog>
      </Flex>
      <div
        className={cn(
          "grid grid-cols-1 lg:grid-cols-3 gap-4 w-full",
          !showMenu ? "lg:grid-cols-1" : ""
        )}
      >
        <div className="col-span-2">
          <Card className="w-full">
            <CardHeaderFilters
              title="Stores"
              filters={[
                {
                  key: "locationId",
                  label: "Location",
                  options:
                    locations?.map((location) => ({
                      label: location.name,
                      value: location._id,
                    })) ?? [],
                },
              ]}
              onFilterChange={(filter) => setFilter(filter)}
            />
            <CardContent>
              <DataTable
                data={stores ?? []}
                columns={StoreColumns}
                filterBy={filter}
              />
            </CardContent>
          </Card>
        </div>
        {showMenu && (
          <div className="col-span-1 w-full">
            <Flex direction="col" gap="md" className="w-full">
              <LocationForm
                title="Location"
                description="Create or update a location for a store."
              />
              {(locations?.length ?? 0) > 0 && (
                <>
                  <Separator />
                  <Flex direction="col" gap="md" className="w-full">
                    <h4 className="text-lg font-semibold">Locations</h4>
                    <ScrollableCard className="w-full" maxHeight="300px">
                      {locations?.map((location) => {
                        const storeCount =
                          stores?.filter(
                            (store) => store.locationId === location._id
                          ).length ?? 0;
                        return (
                          <LocationCard
                            key={location._id}
                            location={location}
                            storeCount={storeCount}
                          />
                        );
                      })}
                    </ScrollableCard>
                  </Flex>
                </>
              )}
            </Flex>
          </div>
        )}
      </div>
    </Flex>
  );
}

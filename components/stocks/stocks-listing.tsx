"use client";

import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { Flex } from "../ui/flex";
import { Card, CardContent } from "../ui/card";
import { CardHeaderFilters, FilterGroup } from "../card-header-with-filters";
import { DataTable } from "../DataTable";
import { useMemo, useState } from "react";
import { StocksTableColumns } from "./stocks-table-column";
import StocksProductRegistrationForm from "./stocks-product-registration-form";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";
import { Plus } from "lucide-react";

export function StocksListing() {
  const [showStockDialog, setShowStockDialog] = useState(false);

  const currentUser = useQuery(api.users.getCurrentUser);
  const stocks = useQuery(api.productsByStore.productsByStore);
  const categories = useQuery(api.categories.getCategories);
  const stores = useQuery(api.stores.getStores);
  const [filters, setFilters] = useState<Record<string, string>>({});

  const generateFilters = useMemo(() => {
    let filters: FilterGroup[] = [];
    filters.push({
      key: "product",
      label: "Category",
      options:
        categories?.map((category) => ({
          value: category._id as string,
          label: category.name,
        })) ?? [],
    });

    if (currentUser?.role === "SUPER_ADMIN") {
      filters = [
        ...filters,
        {
          key: "store",
          label: "Store",
          options:
            stores?.map((store) => ({
              value: store._id as string,
              label: store.name,
            })) ?? [],
        },
      ];
    }

    return filters;
  }, [stores, categories, currentUser?.role]);
  return (
    <Flex direction="col" gap="lg" className="w-full">
      <Flex direction="row" justify="between" align="center" className="w-full">
        <Flex direction="col" gap="xl" className="w-full">
          <Flex
            direction="row"
            justify="between"
            align="center"
            className="w-full"
          >
            <h1 className="text-3xl font-bold">Stocks Listing</h1>
            <Dialog open={showStockDialog} onOpenChange={setShowStockDialog}>
              <DialogTrigger asChild>
                <Button onClick={() => setShowStockDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Stock
                </Button>
              </DialogTrigger>
              {showStockDialog && (
                <DialogContent>
                  <StocksProductRegistrationForm />
                </DialogContent>
              )}
            </Dialog>
          </Flex>

          <Card className="w-full h-full">
            <CardHeaderFilters
              filters={generateFilters}
              onFilterChange={(filters) => setFilters(filters)}
              initialValues={{}}
            />
            <CardContent>
              <DataTable
                showCheckboxes={true}
                data={stocks ?? []}
                columns={StocksTableColumns}
                filterBy={filters}
              />
            </CardContent>
          </Card>
        </Flex>
      </Flex>
    </Flex>
  );
}

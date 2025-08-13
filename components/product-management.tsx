"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Circle, MenuIcon, Pencil, Plus, Trash, Trash2 } from "lucide-react";
import { ProductsTable } from "./ProductTable/products-table";
import { Flex } from "@/components/ui/flex";
import { CreateProductForm } from "./create-product-form";
import { useStoreStore } from "@/store/use-store-store";
import { CardHeaderFilters } from "./card-header-with-filters";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import LocationForm from "./store/location-form";
import { ScrollableCard } from "./ScrollableCard";
import { Separator } from "./ui/separator";
import { cn } from "@/lib/utils";
import { PRODUCT_COLORS } from "@/constants/product-colors";
import CategoryForm from "./product-category-form";

export function ProductManagement() {
  const [showMore, setShowMore] = useState(false);
  const { store } = useStoreStore();
  const products = useQuery(api.products.getAllProducts);
  const stores = useQuery(api.stores.getStores);
  const categories = useQuery(api.categories.getCategories);

  const [filters, setFilters] = useState<Record<string, string>>({});
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

  return (
    <Flex direction="col" gap="lg" className="w-full">
      <Flex direction="row" justify="between" align="center" className="w-full">
        <Flex direction="row" gap="md" justify="between" align="center">
          <h1 className="text-3xl font-bold">Product Management</h1>
        </Flex>
        <Flex direction="row" gap="md" justify="between" align="center">
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Product</DialogTitle>
              </DialogHeader>
              <CreateProductForm />
            </DialogContent>
          </Dialog>
          <Button variant="ghost" onClick={() => setShowMore(!showMore)}>
            <MenuIcon />
          </Button>
        </Flex>
      </Flex>
      <div
        className={cn(
          "w-full grid grid-cols-1 gap-4",
          showMore ? "lg:grid-cols-3" : ""
        )}
      >
        <Card className={cn("w-full", showMore ? "lg:col-span-2" : "")}>
          <CardHeaderFilters
            title="Products"
            className="w-full"
            filters={[
              {
                key: "category",
                options:
                  categories?.map((category) => ({
                    value: category._id,
                    label: category.name,
                  })) ?? [],
              },
              {
                key: "store",
                options:
                  stores?.map((store) => ({
                    value: store._id,
                    label: store.name,
                  })) ?? [],
              },
            ]}
            onFilterChange={(filters) => {
              setFilters(filters);
            }}
            initialValues={filters}
            selectedIds={Array.from(selectedRows)}
            groupActions={[
              {
                key: "edit",
                label: "Edit",
                icon: Pencil,
                onSelect: (ctx) => {
                  console.log(ctx);
                },
              },
              {
                key: "delete",
                label: "Delete",
                icon: Trash,
                onSelect: (ctx) => {
                  console.log(ctx);
                },
              },
            ]}
          />
          <CardContent>
            <ProductsTable
              products={products ?? []}
              filterBy={filters}
              onRowSelect={setSelectedRows}
            />
          </CardContent>
        </Card>
        {showMore && (
          <div className="col-span-1 w-full">
            <Flex direction="col" gap="md" className="w-full">
              <CategoryForm
                title="Category"
                description="Create or update a category for a store."
              />
              {(categories?.length ?? 0) > 0 && (
                <>
                  <Separator />
                  <Flex direction="col" gap="md" className="w-full">
                    <h4 className="text-lg font-semibold">Categories</h4>
                    <ScrollableCard className="w-full" maxHeight="300px">
                      {categories?.map((category) => {
                        const productCount =
                          products?.filter(
                            (product) => product.categoryId === category._id
                          ).length ?? 0;
                        return (
                          <div
                            key={category._id}
                            className="w-full not-last:border-b p-2 px-4 flex justify-between items-center"
                          >
                            <Flex direction="row" gap="md" align="center">
                              <div
                                className={cn(
                                  "h-5 w-5 rounded-full text-muted-foreground capitalize",
                                  PRODUCT_COLORS[category.name]
                                )}
                              />
                              <p>{category.name}</p>
                            </Flex>
                            {productCount > 0 && (
                              <Flex direction="row" gap="md" align="center">
                                <p>{productCount} products</p>
                              </Flex>
                            )}
                            {productCount === 0 && (
                              <Button variant={"ghost"}>
                                <Trash2 className="h-4 w-4 mr-2 text-red-500" />
                              </Button>
                            )}
                          </div>
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

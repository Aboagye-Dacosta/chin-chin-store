"use client";

import { useState, useMemo } from "react";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { Flex } from "./ui/flex";
import { LoadingSpinner } from "./ui/loading-spinner";
import { useCart } from "@/hooks/use-cart";
import { Skeleton } from "./ui/skeleton";

export function ProductGrid() {
  const { products, categories } = useCart();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedPackaging, setSelectedPackaging] = useState<string>("all");

  const filteredProducts = useMemo(
    () =>
      products?.filter((product) => {
        const categoryMatch =
          selectedCategory === "all" ||
          categories
            ?.find((category) => category._id === product.categoryId)
            ?.name.toLowerCase() === selectedCategory.toLowerCase();
        const packagingMatch =
          selectedPackaging === "all" ||
          product.packaging.toLowerCase() === selectedPackaging.toLowerCase();
        return categoryMatch && packagingMatch;
      }) ?? [],
    [products, selectedCategory, selectedPackaging]
  );

  const categoryNames = [
    "all",
    ...(categories?.map((category) => category.name) ?? []),
  ];
  const packagingTypes = ["all", "can", "bag"];

  const loading = categories == null || products == null;

  return (
    <div className="space-y-8 min-h-screen" id="products">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-4">Our Premium Chips</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Choose from our carefully curated selection of premium chips,
          available in different flavors and packaging options.
        </p>
      </div>

      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-center justify-center">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-[200px] w-full " />
          ))}
        </div>
      )}

      {!loading && (
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
          <div className="flex flex-col md:flex-row gap-2 items-center">
            <span className="text-sm font-medium">Flavor:</span>
            <Flex direction="row" gap="md">
              {categoryNames.map((category) => (
                <Button
                  key={category}
                  variant={
                    selectedCategory === category ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="capitalize"
                >
                  {category}
                </Button>
              ))}
            </Flex>
          </div>
          <div className="flex flex-col md:flex-row gap-2 items-center">
            <span className="text-sm font-medium">Packaging:</span>
            <Flex direction="row" gap="md">
              {packagingTypes.map((packaging) => (
                <Button
                  key={packaging}
                  variant={
                    selectedPackaging === packaging ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => setSelectedPackaging(packaging)}
                  className="capitalize"
                >
                  {packaging}
                </Button>
              ))}
            </Flex>
          </div>
        </div>
      )}

      {!loading && filteredProducts?.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 my-8">
          {filteredProducts?.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}

      {!loading && filteredProducts?.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No products found matching your filters.
          </p>
        </div>
      )}
    </div>
  );
}

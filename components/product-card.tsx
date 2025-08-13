"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Package } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import Scene from "./model";
import { toast } from "sonner";
import { useCallback, useTransition } from "react";
import { cn } from "@/lib/utils";
import { PRODUCT_COLORS } from "@/constants/product-colors";
import { displayMoney } from "@/lib/display-money";
import { Product } from "@/types/convex-types";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: Readonly<ProductCardProps>) {
  const { addItem ,categories} = useCart();
  const [isAdding, startTransition] = useTransition();

  const handleAddToCart = () => {
    startTransition(async () => {
      await addItem(product);
      toast.success(`${product.title} has been added to your cart.`);
    });
  };

  const getModelUrl = useCallback((packaging: string, category: string) => {
    switch (packaging) {
      case "Can":
        return `/models/${category.toLowerCase()}-can.glb`;
      case "Bag":
        return `/models/${category.toLowerCase()}-bag.glb`;
      default:
        return `/models/${category.toLowerCase()}-bag.glb`;
    }
  }, []);

  const category = categories?.find((category) => category._id === product.categoryId);

  return (
    <Card className="overflow-hidden border-none shadow-none p-1 rounded-lg">
      <CardHeader className="p-0">
        <div className="relative h-[300px] w-full z-1">
          <div
            className={cn(
              "absolute rounded-[30%_70%_70%_30%_/_30%_30%_70%_70%] -z-1 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2/3 h-2/3 bg-amber-600 shadow-lg",
              PRODUCT_COLORS[category?.name.toLowerCase() ?? ""]
            )}
          ></div>
          <Scene
            modelUrl={getModelUrl(product.packaging, category?.name ?? "")}
          />
          <div className="absolute top-2 left-2 flex gap-2">
            <Badge
              className={PRODUCT_COLORS[category?.name.toLowerCase() ?? ""]}
            >
              {category?.name}
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Package className="h-3 w-3" />
              {product.packaging}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-2">
        <Card className="p-1">
          <CardContent>
            <h3 className="font-semibold text-lg mb-2">{product.title}</h3>
            <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
              {product.description}
            </p>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">
                {displayMoney(product.price)}
              </span>
              <span className="text-sm text-muted-foreground">
                {product.stock} in stock
              </span>
            </div>
          </CardContent>
          <CardFooter className="p-4 pt-0">
            <Button
              onClick={handleAddToCart}
              className={cn(
                "w-full",
                PRODUCT_COLORS[category?.name.toLowerCase() ?? ""]
              )}
              disabled={product.stock === 0 || isAdding}
              loading={isAdding}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
            </Button>
          </CardFooter>
        </Card>
      </CardContent>
    </Card>
  );
}

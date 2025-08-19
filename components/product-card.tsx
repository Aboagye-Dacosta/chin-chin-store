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
import { toast } from "sonner";
import { Suspense, useTransition } from "react";
import { cn } from "@/lib/utils";
import { displayMoney } from "@/lib/display-money";
import { ProductWithCategory } from "@/types/convex-types";
import { useAppThemeStore } from "@/store/use-app-theme";
import { useAuth } from "@clerk/nextjs";
import LargeModelCard from "./model";
import Image from "next/image";

interface ProductCardProps {
  product: ProductWithCategory;
}

export function ProductCard({ product }: Readonly<ProductCardProps>) {
  const { addItem } = useCart();
  const [isAdding, startTransition] = useTransition();
  const { categoryColors } = useAppThemeStore();
  const { isSignedIn } = useAuth();

  const handleAddToCart = () => {
    startTransition(async () => {
      await addItem(product);
      toast.success(`${product.title} has been added to your cart.`);
    });
  };

  const isLoading = isAdding && isSignedIn;

  return (
    <Card className="overflow-hidden border-none shadow-none p-0 rounded-lg space-y-0">
      <CardHeader className="p-0 my-0">
        <div className="relative h-[300px] w-full z-1">
          <div
            className={cn(
              "absolute rounded-[30%_70%_70%_30%_/_30%_30%_70%_70%] -z-1 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2/3 h-2/3 bg-amber-600 shadow-lg"
            )}
            style={{
              backgroundColor:
                categoryColors[product?.category?.name ?? ""] ??
                product?.category?.color,
            }}
          ></div>
          <Suspense
            fallback={
              <div className="h-[300px] w-full">
                <Image
                  src={product?.image ?? ""}
                  alt={product?.title ?? ""}
                  fill
                  className="object-contain"
                />
              </div>
            }
          >
            <LargeModelCard src={product?.model ?? ""} />
          </Suspense>
          <div className="absolute top-2 left-2 flex gap-2">
            <Badge
              style={{
                backgroundColor:
                  categoryColors[product?.category?.name ?? ""] ??
                  product?.category?.color,
                color: "white",
              }}
            >
              {product?.category?.name}
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Package className="h-3 w-3" />
              {product.packaging}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="-mt-6 py-0 ">
        <Card className="p-1 my-0">
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
              className={cn("w-full flex items-center justify-center")}
              disabled={product.stock === 0 || isAdding}
              loading={isLoading}
            >
              {!isLoading && <ShoppingCart className="h-4 w-4 mr-2" />}
              {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
            </Button>
          </CardFooter>
        </Card>
      </CardContent>
    </Card>
  );
}

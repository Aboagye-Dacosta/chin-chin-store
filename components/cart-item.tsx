"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2 } from "lucide-react";
import { useCallback, memo, useTransition, useMemo } from "react";
import { useCart } from "@/hooks/use-cart";
import { displayMoney } from "@/lib/display-money";
import { CartItem as CartItemType } from "@/types/convex-types";
import { Flex } from "./ui/flex";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import { CartItemAction } from "./cart-item-action";
import { Badge } from "./ui/badge";
import { cn } from "@/lib/utils";

export const CartItem = memo(({ cartItem }: { cartItem: CartItemType }) => {
  const { removeItem, products, categories } = useCart();

  const [isRemoving, startRemoveTransition] = useTransition();

  const product = useMemo(
    () => products?.find((p) => p?._id === cartItem.productId),
    [products, cartItem.productId]
  );

  const category = useMemo(
    () => categories?.find((c) => c._id === product?.categoryId),
    [categories, product?.categoryId]
  );

  const handleRemove = useCallback(() => {
    startRemoveTransition(async () => {
      await removeItem(cartItem._id);
    });
  }, [cartItem._id, removeItem]);

  const isDisabled = useMemo(() => product?.stock === 0 || product?.status === "Inactive", [product]);

  return (
    <TooltipProvider>
      <Card
        className={cn(
          isDisabled && "opacity-50"
        )}
      >
        <CardContent className="p-6 relative">
          <div className="absolute -top-3 right-2 flex items-center gap-2">
            {isDisabled && (
              <Badge variant="destructive">Out of stock</Badge>
            )}
            {product?.stock && product?.stock < cartItem.quantity && (
              <Badge variant="default">In stock: {product?.stock}</Badge>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center space-x-4">
            <div className="relative h-20 w-20 rounded-md overflow-hidden">
              <Image
                src={product?.image || "/placeholder.svg"}
                alt={product?.title || ""}
                fill
                className="object-contain"
              />
            </div>

            <div className="flex-1 text-center space-y-2 sm:space-y-0 sm:text-left">
              <h3 className="font-semibold">{product?.title}</h3>
              {category && product?.packaging && (
                <p className="text-sm text-muted-foreground capitalize">
                  {category.name} • {product?.packaging} packaging
                </p>
              )}
              <p className="font-semibold">
                {displayMoney(product?.price ?? 0)}
              </p>
            </div>

            <Flex direction="row" gap="md" align="center">
              {
                //conditions not to show actions
                //1. out of stock
                //2. product is inacative
                //3.
              }
              {!isDisabled && (
                <CartItemAction product={product!} cartItem={cartItem} />
              )}

              <Button
                variant="ghost"
                size="icon"
                onClick={handleRemove}
                className="text-red-500 hover:text-red-700"
                loading={isRemoving}
              >
                {!isRemoving && <Trash2 className="h-4 w-4" />}
              </Button>
            </Flex>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
});

CartItem.displayName = "CartItem";

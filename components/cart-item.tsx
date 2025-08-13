"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCallback, memo, useTransition, useMemo } from "react";
import { useCart } from "@/hooks/use-cart";
import { displayMoney } from "@/lib/display-money";
import { CartItem as CartItemType } from "@/types/convex-types";
import { Flex } from "./ui/flex";

export const CartItem = memo(({ cartItem }: { cartItem: CartItemType }) => {
  const { updateQuantity, removeItem, products, categories } = useCart();
  const [isIncrementing, startIncrementTransition] = useTransition();
  const [isDecrementing, startDecrementTransition] = useTransition();
  const [isRemoving, startRemoveTransition] = useTransition();

  const product = useMemo(
    () => products?.find((p) => p._id === cartItem.productId),
    [products, cartItem.productId]
  );
  const category = useMemo(
    () => categories?.find((c) => c._id === product?.categoryId),
    [categories, product?.categoryId]
  );

  const handleIncrement = useCallback(() => {
    startIncrementTransition(async () => {
      await updateQuantity(
        cartItem._id,
        cartItem.quantity + 1,
        product?.price ?? 0
      );
    });
  }, [cartItem._id, cartItem.quantity, updateQuantity]);

  const handleDecrement = useCallback(() => {
    startDecrementTransition(async () => {
      await updateQuantity(
        cartItem._id,
        Math.max(1, cartItem.quantity - 1),
        product?.price ?? 0
      );
    });
  }, [cartItem._id, cartItem.quantity, updateQuantity]);

  const handleQuantityChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      updateQuantity(
        cartItem._id,
        parseInt(e.target.value) || 1,
        product?.price ?? 0
      );
    },
    [cartItem._id, updateQuantity]
  );

  const handleRemove = useCallback(() => {
    startRemoveTransition(async () => {
      await removeItem(cartItem._id);
    });
  }, [cartItem._id, removeItem]);

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row items-center space-x-4">
          <div className="relative h-20 w-20 rounded-md overflow-hidden">
            <Image
              src={product?.image || "/placeholder.svg"}
              alt={product?.title || ""}
              fill
              className="object-cover"
            />
          </div>

          <div className="flex-1 text-center space-y-2 sm:space-y-0 sm:text-left">
            <h3 className="font-semibold">{product?.title}</h3>
            {category && product?.packaging && (
              <p className="text-sm text-muted-foreground capitalize">
                {category.name} • {product?.packaging} packaging
              </p>
            )}
            <p className="font-semibold">{displayMoney(product?.price ?? 0)}</p>
          </div>

          <Flex direction="row" gap="md" align="center">
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="icon"
                loading={isDecrementing}
                disabled={isDecrementing || cartItem.quantity <= 1}
                onClick={handleDecrement}
              >
                {!isDecrementing && <Minus className="h-4 w-4" />}
              </Button>
              <Input
                type="number"
                value={cartItem.quantity}
                onChange={handleQuantityChange}
                className="w-16 text-center"
                min="1"
              />
              <Button
                variant="outline"
                size="icon"
                loading={isIncrementing}
                disabled={isIncrementing}
                onClick={handleIncrement}
              >
                {!isIncrementing && <Plus className="h-4 w-4" />}
              </Button>
            </div>

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
  );
});

CartItem.displayName = "CartItem";

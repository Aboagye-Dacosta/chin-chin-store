import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ProductWithStock, CartItem } from "@/types/convex-types";
import { useCart } from "@/hooks/use-cart";
import { useCallback, useTransition } from "react";
import { Minus, Plus } from "lucide-react";

interface CartItemActionProps {
  product: ProductWithStock;
  cartItem: CartItem;
}

export const CartItemAction = ({ product, cartItem }: CartItemActionProps) => {
  const { updateQuantity } = useCart();
  const [isIncrementing, startIncrementTransition] = useTransition();
  const [isDecrementing, startDecrementTransition] = useTransition();

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
  return (
    <div className="flex items-center space-x-2">
      <Tooltip>
        <TooltipTrigger>
          <Button
            variant="outline"
            size="icon"
            loading={isDecrementing}
            disabled={isDecrementing || cartItem.quantity <= 1}
            onClick={handleDecrement}
          >
            {!isDecrementing && <Minus className="h-4 w-4" />}
          </Button>
        </TooltipTrigger>
        {cartItem.quantity <= 1 && (
          <TooltipContent>
            <p>Cannot decrement below 1</p>
          </TooltipContent>
        )}
      </Tooltip>
      <Input
        type="number"
        value={cartItem.quantity}
        onChange={handleQuantityChange}
        className="w-16 text-center"
        min="1"
      />
      <Tooltip>
        <TooltipTrigger>
          <Button
            variant="outline"
            size="icon"
            loading={isIncrementing}
            disabled={isIncrementing || cartItem.quantity >= product?.stock!}
            onClick={handleIncrement}
          >
            {!isIncrementing && <Plus className="h-4 w-4" />}
          </Button>
        </TooltipTrigger>
        {cartItem.quantity >= product?.stock! && (
          <TooltipContent>
            <p>Cannot increment above stock</p>
          </TooltipContent>
        )}
      </Tooltip>
    </div>
  );
};

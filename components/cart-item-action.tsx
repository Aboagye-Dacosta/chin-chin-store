import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useCart } from "@/hooks/use-cart";
import { CartItem, ProductWithStock } from "@/types/convex-types";
import { Minus, Plus } from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";

type ProductWithStockUI = Omit<ProductWithStock, "image" | "model"> & {
  image?: string | null;
  model?: string | null;
};

interface CartItemActionProps {
  product: ProductWithStockUI;
  cartItem: CartItem;
}

export const CartItemAction = ({ product, cartItem }: CartItemActionProps) => {
  const { updateQuantity } = useCart();
  const [isIncrementing, setIsIncrementing] = useState(false);
  const [isDecrementing, setIsDecrementing] = useState(false);

  const handleIncrement = useCallback(async () => {
    setIsIncrementing(true);
    try {
      await updateQuantity(
        cartItem._id,
        cartItem.quantity + 1,
        product?.price ?? 0
      );
    } catch {
      toast.error("Failed to increment quantity");
    } finally {
      setIsIncrementing(false);
    }
  }, [cartItem._id, cartItem.quantity, updateQuantity, product?.price]);

  const handleDecrement = useCallback(async () => {
    setIsDecrementing(true);
    try {
      await updateQuantity(
        cartItem._id,
        Math.max(1, cartItem.quantity - 1),
        product?.price ?? 0
      );
    } catch {
      toast.error("Failed to decrement quantity");
    } finally {
      setIsDecrementing(false);
    }
  }, [cartItem._id, cartItem.quantity, updateQuantity, product?.price]);

  const handleQuantityChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      updateQuantity(
        cartItem._id,
        parseInt(e.target.value) || 1,
        product?.price ?? 0
      );
    },
    [cartItem._id, updateQuantity, product?.price]
  );
  return (
    <div className="flex items-center space-x-2">
      <Tooltip>
        <TooltipTrigger onClick={handleDecrement}>
          <Button
            variant="outline"
            size="icon"
            asChild
            loading={isDecrementing}
            disabled={isDecrementing || cartItem.quantity <= 1}
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
        <TooltipTrigger onClick={handleIncrement}>
          <Button
            variant="outline"
            size="icon"
            asChild
            loading={isIncrementing}
            disabled={
              isIncrementing || cartItem.quantity >= (product?.stock ?? 0)
            }
          >
            {!isIncrementing && <Plus className="h-4 w-4" />}
          </Button>
        </TooltipTrigger>
        {cartItem.quantity >= (product?.stock ?? 0) && (
          <TooltipContent>
            <p>Cannot increment above stock</p>
          </TooltipContent>
        )}
      </Tooltip>
    </div>
  );
};

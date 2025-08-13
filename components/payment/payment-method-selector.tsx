import { PaymentMethod } from "@prisma/client";
import { Label } from "../ui/label";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { cn } from "@/lib/utils";
import { Smartphone, HandCoins } from "lucide-react";

export const PaymentMethodSelector = ({
  value,
  onChange,
}: {
  value: PaymentMethod;
  onChange: (method: PaymentMethod) => void;
}) => (
  <div>
    <Label className="mb-2 block">Payment method</Label>
    <RadioGroup
      value={value}
      onValueChange={onChange}
      className="grid grid-cols-1 gap-3 md:grid-cols-2"
    >
      <div>
        <RadioGroupItem id="mm" value="MOBILE_MONEY" className="peer sr-only" />
        <Label
          htmlFor="mm"
          className={cn(
            "flex w-full cursor-pointer items-center gap-3 rounded-md border-2 p-4 transition-colors",
            "hover:bg-accent hover:text-accent-foreground",
            "peer-data-[state=checked]:border-primary"
          )}
        >
          <Smartphone className="h-5 w-5" />
          <div className="grid">
            <span className="font-medium">Mobile money</span>
            <span className="text-xs text-muted-foreground">
              Pay with your mobile wallet
            </span>
          </div>
        </Label>
      </div>

      <div>
        <RadioGroupItem
          id="cod"
          value="PAYMENT_ON_DELIVERY"
          className="peer sr-only"
        />
        <Label
          htmlFor="cod"
          className={cn(
            "flex w-full cursor-pointer items-center gap-3 rounded-md border-2 p-4 transition-colors",
            "hover:bg-accent hover:text-accent-foreground",
            "peer-data-[state=checked]:border-primary"
          )}
        >
          <HandCoins className="h-5 w-5" />
          <div className="grid">
            <span className="font-medium">Pay on delivery</span>
            <span className="text-xs text-muted-foreground">
              Cash or POS on delivery
            </span>
          </div>
        </Label>
      </div>
    </RadioGroup>
  </div>
);

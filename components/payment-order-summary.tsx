import { useAppStore } from "@/hooks/use-app-store";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Separator } from "./ui/separator";
import { displayMoney } from "@/lib/display-money";
import { useMemo } from "react";

export const PaymentOrderSummary = ({
  deliveryFee,
}: {
  deliveryFee: number;
}) => {
  const { totalPrice } = useAppStore();
  const amount = useMemo(
    () => (totalPrice ?? 0) + deliveryFee,
    [totalPrice, deliveryFee]
  );
  return (
    <Card>
      <CardHeader>
        <CardTitle>Order summary</CardTitle>
        <CardDescription>Review your total before paying.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center text-sm">
          <span className="text-muted-foreground">Items total</span>
          <span className="ml-auto font-medium">
            {displayMoney(totalPrice ?? 0)}
          </span>
        </div>
        <div className="flex items-center text-sm">
          <span className="text-muted-foreground">Delivery</span>
          <span className="ml-auto font-medium">
            {displayMoney(deliveryFee)}
          </span>
        </div>
        <Separator />
        <div className="flex items-center text-base font-semibold">
          <span>Amount to pay</span>
          <span className="ml-auto">{displayMoney(amount)}</span>
        </div>
      </CardContent>
    </Card>
  );
};

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Separator } from "./ui/separator";

import { Store, MapPin, User } from "lucide-react";
import { StoreWithLocation } from "@/types/convex-types";

interface StoreDetailCardProps {
  store: StoreWithLocation | null;
}

export function StoreDetailCard({ store }: Readonly<StoreDetailCardProps>) {
  return (
    <Card className="w-full max-w-md shadow-none border-none">
      <CardHeader>
        <div className="flex flex-col items-start justify-start">
          <CardTitle className="flex items-center gap-2">
            <Store className="h-5 w-5" />
            {store?.name}
          </CardTitle>
          <CardDescription>
            <div className="flex  items-center gap-2 p-3">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <div className="flex-1">
                <div className="font-medium">{store?.location?.name}</div>
                <div className="text-sm text-muted-foreground">Location</div>
              </div>
            </div>
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <Separator />
        {store?.deliveryCharge && (
          <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <div className="flex-1">
              <div className="font-medium">{store?.deliveryCharge?.amount}</div>
              <div className="text-sm text-muted-foreground">
                Delivery Charge
              </div>
            </div>
          </div>
        )}
        {store?.vendors?.map((vendor) => (
          <div
            className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg not-last:border-b not-last:border-muted"
            key={vendor.name}
          >
            <User className="h-4 w-4 text-muted-foreground" />
            <div className="flex-1">
              <div className="font-medium">{vendor?.name}</div>
              <div className="text-sm text-muted-foreground">Vendor</div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

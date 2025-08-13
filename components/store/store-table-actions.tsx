import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { MoreVertical } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { api } from "@/convex/_generated/api";
import { DeliveryChargeForm } from "./delivery-charge-form";
import { Store } from "@/types/convex-types";
import { useQuery } from "convex/react";
import StoreForm from "./store-form";

export function StoreTableActions({ store }: Readonly<{ store: Store }>) {
  const [open, setOpen] = useState(false);
  const [openUpdate, setOpenUpdate] = useState(false);
  const deliveryCharge = useQuery(api.deliveryCharge.getDeliveryCharge, {
    storeId: store._id,
  });

  const hasDeliveryCharge = !!store.deliveryChargeId;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setOpenUpdate(true)}>
            Update
          </DropdownMenuItem>
          <DropdownMenuItem>Delete</DropdownMenuItem>
          <DropdownMenuItem onClick={() => setOpen(true)}>
            {hasDeliveryCharge ? "Update" : "Add"} Delivery Charge
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="p-[24px]">
        <DialogHeader>
          <DialogTitle>
            {hasDeliveryCharge ? "Update" : "Add"} Delivery Charge
          </DialogTitle>
        </DialogHeader>
          <DeliveryChargeForm
            storeId={store._id}
            defaultDeliveryCharge={deliveryCharge ?? undefined}
          />
        </DialogContent>
      </Dialog>
      <Dialog open={openUpdate} onOpenChange={setOpenUpdate}>
        <DialogHeader className="sr-only">
          <DialogTitle>Update Store</DialogTitle>
        </DialogHeader>
        <DialogContent>
          <StoreForm defaultValue={store} title="Update Store" />
        </DialogContent>
      </Dialog>
    </>
  );
}

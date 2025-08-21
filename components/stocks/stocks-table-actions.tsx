"use client";
import { ProductByStore } from "@/types/convex-types";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { MoreVertical } from "lucide-react";
import { useState } from "react";
import { CustomAlertDialog } from "../custom-alert-dislog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import StocksProductRegistrationForm from "./stocks-product-registration-form";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export const StocksTableActions = ({ stock }: { stock: ProductByStore }) => {
  const [open, setOpen] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const removeProductFromStore = useMutation(
    api.productsByStore.removeProductFromStore
  );

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setOpen(true)}>
            update
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setOpenDelete(true)}>
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {open && (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogHeader className="p-0 sr-only">
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>
          <DialogContent>
            <StocksProductRegistrationForm
              initialValues={{
                productId: stock.productId ?? "",
                storeId: stock.storeId ?? "",
                quantity: stock.quantity ?? 0,
              }}
            />
          </DialogContent>
        </Dialog>
      )}
      {openDelete && (
        <CustomAlertDialog
          open={openDelete}
          onOpenChange={setOpenDelete}
          title="Delete Product"
          description="Are you sure you want to delete this product?"
          actionText="Delete"
          cancelText="Cancel"
          action={() =>
            removeProductFromStore({
              productId: stock.productId,
              storeId: stock.storeId,
            })
          }
          cancel={() => setOpenDelete(false)}
        />
      )}
    </>
  );
};

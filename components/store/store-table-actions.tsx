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
import { Store } from "@/types/convex-types";
import StoreForm from "./store-form";

export function StoreTableActions({ store }: Readonly<{ store: Store }>) {
  const [openUpdate, setOpenUpdate] = useState(false);

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
        </DropdownMenuContent>
      </DropdownMenu>

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

import { DropdownMenu, DropdownMenuTrigger ,  DropdownMenuContent,
    DropdownMenuItem,} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { MoreVertical } from "lucide-react";
import { useState } from "react";
import { CustomAlertDialog } from "../custom-alert-dislog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { CreateProductForm } from "../create-product-form";
import { Product } from "@/types/convex-types";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export const ProductsTableActions = ({
  row,
}: {
  row: Product;
}) => {
  const [openUpdateDialog, setOpenUpdateDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const deleteProduct = useMutation(api.products.deleteProduct);
  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => setOpenUpdateDialog(true)}>
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setOpenDeleteDialog(true)}>
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {openDeleteDialog && (
        <CustomAlertDialog
          open={openDeleteDialog}
          onOpenChange={setOpenDeleteDialog}
          title="Delete Product"
          description="Are you sure you want to delete this product?"
          actionText="Delete"
          cancelText="Cancel"
          action={() => deleteProduct({productId: row._id})}
          cancel={() => setOpenDeleteDialog(false)}
        />
      )}
      {openUpdateDialog && (
        <Dialog open={openUpdateDialog} onOpenChange={setOpenUpdateDialog}>
          <DialogHeader className="p-0 sr-only">
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>
          <DialogContent>
            <CreateProductForm
              defaultProduct={row}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

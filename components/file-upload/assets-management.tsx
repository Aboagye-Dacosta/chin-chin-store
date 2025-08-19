import { Flex } from "../ui/flex";
import { Dialog, DialogTrigger, DialogContent } from "../ui/dialog";
import { Button } from "../ui/button";
import { Plus } from "lucide-react";
import { FileUploadForm } from "./file-upload-form";
import { AssetsList } from "./assets-list";

export const AssetsManagement = () => {
  return (
    <Flex direction="col" gap="lg" className="w-full">
      <h1>Assets Management</h1>
      <Dialog>
        <DialogTrigger asChild>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Asset
          </Button>
        </DialogTrigger>
        <DialogContent className="!max-w-[700px] w-full">
          <FileUploadForm />
        </DialogContent>
      </Dialog>
      <AssetsList />
    </Flex>
  );
};

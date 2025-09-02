import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Image from "next/image";
import { Flex } from "../ui/flex";
import ModelViewer from "./model-viewer";
import { Button } from "../ui/button";
import { Pen, Trash } from "lucide-react";
import { Dialog, DialogTrigger, DialogContent } from "../ui/dialog";
import { FileUploadForm } from "./file-upload-form";
import {
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTrigger,
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from "../ui/alert-dialog";
import { useState } from "react";
import { useMutation } from "convex/react";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";
import { ConvexError } from "convex/values";
import { Asset } from "@/types/convex-types";

export const AssetsList = () => {
  const assets = useQuery(api.assets.getAssets);
  const [open, setOpen] = useState(false);
  const [assetId, setAssetId] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const deleteAsset = useMutation(api.assets.deleteAsset);

  const handleDeleteAsset = async () => {
    setIsDeleting(true);
    try {
      await deleteAsset({ assetId: assetId as Id<"assets"> });
    } catch (err) {
      toast.error((err as ConvexError<"assets">).data);
    } finally {
      setIsDeleting(false);
      setOpen(false);
    }
  };

  if (!assets) return null;
  if (assets.length === 0) return null;

  return (
    <>
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Assets List</CardTitle>
        </CardHeader>
        <CardContent>
          {assets?.map((asset) => (
            <Flex
              key={asset._id}
              className="items-center gap-4 not-last:border-b not-last:pb-4 not-first:pt-4"
            >
              {asset.isModel ? (
                <ModelViewer src={asset?.url ?? ""} />
              ) : (
                <Image
                  src={asset?.url ?? ""}
                  alt={asset.name}
                  width={100}
                  height={100}
                  className="w-[50px] h-[50px] object-contain"
                />
              )}
              <h2 className="flex-1">
                <Flex direction="col" gap="sm">
                  {asset.name}
                  <span className="text-xs text-muted-foreground">
                    {asset.isModel && <p>( Model )</p>}
                  </span>
                </Flex>
              </h2>
              <Flex>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Pen />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <FileUploadForm defaultAsset={asset} />
                  </DialogContent>
                </Dialog>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setAssetId(asset._id);
                    setOpen(true);
                  }}
                >
                  <Trash className="text-red-500" />
                </Button>
              </Flex>
            </Flex>
          ))}
        </CardContent>
      </Card>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this
              asset.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button
                disabled={isDeleting}
                loading={isDeleting}
                onClick={handleDeleteAsset}
              >
                Delete
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

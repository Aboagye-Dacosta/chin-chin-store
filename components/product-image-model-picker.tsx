import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Flex } from "./ui/flex";
import { Card, CardContent } from "./ui/card";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import Image from "next/image";
import { Label } from "./ui/label";
import { useState, useMemo, useEffect, Suspense } from "react";
import TinyModelCard from "./file-upload/model-viewer";
import { LoadingSpinner } from "./ui/loading-spinner";

export default function ProductImageModelPickerDialog({
  value,
  label,
  onChange,
  btnVariant = "outline",
  className,
  assetType,
}: Readonly<{
  label?: string;
  className?: string;
  btnVariant?: "outline" | "default";
  assetType?: "image" | "model";
  value: string;
  onChange: (value: string) => void;
}>) {
  const [selectedProduct, setSelectedProduct] = useState<string>(value);
  const assets = useQuery(api.assets.getAssets);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleProductChange = (productId: string) => {
    onChange(productId);
    setIsDialogOpen(false);
  };

  const selectedAsset = useMemo(
    () => assets?.find((asset) => asset._id === value),
    [assets, value]
  );

  const images = useMemo(
    () => assets?.filter((asset) => asset.isModel === false) ?? [],
    [assets]
  );

  const models = useMemo(
    () => assets?.filter((asset) => asset.isModel === true) ?? [],
    [assets]
  );

  useEffect(() => {
    if (value) {
      setSelectedProduct(value);
    }
  }, [value]);

  return (
    <>
      <Button
        variant={btnVariant}
        className={className}
        onClick={() => setIsDialogOpen(true)}
        type="button"
      >
        <Flex direction="row" gap="sm" align="center">
          {selectedAsset?.url && (
            <div className="h-[20px] w-[20px]">
              {selectedAsset?.isModel ? (
                <Suspense fallback={<LoadingSpinner />}>
                  <TinyModelCard
                    src={selectedAsset?.url}
                    className="border-none bg-transparent shadow-none !h-[20px] w-[20px]"
                  />
                </Suspense>
              ) : (
                <Image
                  src={selectedAsset?.url}
                  alt={selectedAsset?.name}
                  width={10}
                  height={10}
                  className="object-contain"
                />
              )}
            </div>
          )}
          <span className="text-sm line-clamp-1">
            {selectedAsset?.name ?? label}
          </span>
        </Flex>
      </Button>
      {isDialogOpen && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="!max-w-[370px]">
            <DialogHeader>
              <DialogTitle>
                {assetType === "image" ? "Image Picker" : "Model Picker"}
              </DialogTitle>
            </DialogHeader>
            <RadioGroup
              value={selectedProduct}
              onValueChange={setSelectedProduct}
            >
              <Flex direction="row" gap="md" wrap={true}>
                {assetType === "image" &&
                  (images?.length > 0 ? (
                    images?.map((image) => (
                      <Label
                        className="text-sm"
                        htmlFor={image._id}
                        key={image._id}
                      >
                        <Card>
                          <CardContent className="flex gap-2 items-center">
                            <RadioGroupItem value={image._id} id={image._id} />
                            <div className="h-[30px] w-[30px]">
                              <Image
                                src={image?.url ?? ""}
                                alt={image.name}
                                width={30}
                                height={30}
                                className="object-contain h-[30px] w-[30px]"
                              />
                            </div>
                          </CardContent>
                        </Card>
                      </Label>
                    ))
                  ) : (
                    <p>No images found</p>
                  ))}

                {assetType === "model" &&
                  (models?.length > 0 ? (
                    models?.map((model) => (
                      <Card key={model._id}>
                        <CardContent className="flex gap-2 items-center">
                          <RadioGroupItem value={model._id} id={model._id} />
                          <Label className="text-sm" htmlFor={model._id}>
                            <div className="h-[30px] w-[30px]">
                              <Suspense fallback={<LoadingSpinner />}>
                                <TinyModelCard
                                  src={model?.url ?? ""}
                                  className="border-none shadow-none"
                                />
                              </Suspense>
                            </div>
                          </Label>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <p>No models found</p>
                  ))}
              </Flex>
            </RadioGroup>
            <DialogFooter>
              <Flex
                direction="row"
                justify="between"
                align="center"
                className="w-full"
              >
                <DialogClose asChild>
                  <Button variant="outline" className="flex-1">
                    Cancel
                  </Button>
                </DialogClose>
                <Button
                  onClick={() => handleProductChange(selectedProduct)}
                  className="flex-1"
                >
                  Save
                </Button>
              </Flex>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

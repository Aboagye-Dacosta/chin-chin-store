import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Flex } from "./ui/flex";
import { Card, CardContent } from "./ui/card";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import Image from "next/image";
import { Label } from "./ui/label";
import { useState, useMemo, useEffect } from "react";

export default function ProductPickerDialog({
  value,
  label,
  onChange,
  btnVariant = "outline",
  className,
}: Readonly<{
  label?: string;
  className?: string;
  btnVariant?: "outline" | "default";
  value: string;
  onChange: (value: string) => void;
}>) {
  const [selectedProduct, setSelectedProduct] = useState<string>(value);
  const products = useQuery(api.products.getAllProducts);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleProductChange = (productId: string) => {
    onChange(productId);
    setIsDialogOpen(false);
  };

  const product = useMemo(
    () => products?.find((product) => product._id === selectedProduct),
    [products, selectedProduct]
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
          {product?.image && (
            <div className="h-[20px] w-[20px]">
              <Image
                src={product?.image}
                alt={product.title}
                width={10}
                height={10}
                className="object-contain"
              />
            </div>
          )}
          <span className="text-sm line-clamp-1">
            {product?.title ?? label}
          </span>
        </Flex>
      </Button>
      {isDialogOpen && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="!max-w-[300px] w-full">
            <DialogHeader>
              <DialogTitle>Product Picker</DialogTitle>
            </DialogHeader>
            <RadioGroup
              value={selectedProduct}
              onValueChange={setSelectedProduct}
            >
              <Flex direction="row" gap="md" wrap={true}>
                {products?.map((product) => (
                  <Label
                    className="text-sm"
                    htmlFor={product._id}
                    key={product._id}
                  >
                    <Card>
                      <CardContent className="flex gap-2 items-center">
                        <RadioGroupItem value={product._id} id={product._id} />
                        <div className="h-[30px] w-[30px]">
                          <Image
                            src={product?.image ?? ""}
                            alt={product.title}
                            width={30}
                            height={30}
                            className="object-contain h-[30px] w-[30px]"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </Label>
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

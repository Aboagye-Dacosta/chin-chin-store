import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import {
  Dialog,
  DialogContent,
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
import { useState, useMemo } from "react";

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
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const products = useQuery(api.products.getAllProducts);

  const handleProductChange = (productId: string) => {
    setSelectedProduct(productId);
    onChange(productId);
  };

  const product = useMemo(
    () => products?.find((product) => product._id === value),
    [products, value]
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={btnVariant} className={className}>
          <Flex direction="row" gap="sm">
            {product?.image && (
              <Image
                src={product?.image}
                alt={product.title}
                width={20}
                height={20}
                className="object-contain"
              />
            )}
            <span className="text-sm line-clamp-1">
              {label ?? product?.title}
            </span>
          </Flex>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Product Picker</DialogTitle>
        </DialogHeader>
        <RadioGroup value={value} onValueChange={handleProductChange}>
          <Flex direction="row" gap="md" wrap={true}>
            {products?.map((product) => (
              <Card key={product._id}>
                <CardContent className="p-4 flex gap-2 items-center">
                  <RadioGroupItem value={product._id} id={product._id} />
                  <Label className="text-sm" htmlFor={product._id}>
                    <div className="h-[50px] w-[50px]">
                      <Image
                        src={product?.image ?? ""}
                        alt={product.title}
                        width={50}
                        height={50}
                        className="object-contain"
                      />
                    </div>
                  </Label>
                </CardContent>
              </Card>
            ))}
          </Flex>
        </RadioGroup>
      </DialogContent>
    </Dialog>
  );
}

"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAppStore } from "@/hooks/use-app-store";
import { Flex } from "./ui/flex";
import Image from "next/image";
import { Badge } from "./ui/badge";
import { displayMoney } from "@/lib/display-money";
import { LoadingSpinner } from "./ui/loading-spinner";
import { useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAppThemeStore } from "@/store/use-app-theme";
import { useCart } from "@/hooks/use-cart";

interface CartSummaryProps {
  deliveryPrice?: number;
}

export function CartSummary({ deliveryPrice = 0 }: Readonly<CartSummaryProps>) {
  const { totalPrice, isLoadingCartItems, products } = useAppStore();
  const { items: serverItems } = useCart();
  const categories = useQuery(api.categories.getCategories);
  const { categoryColors } = useAppThemeStore();

  const hasContent = useMemo(
    () => (serverItems?.length ?? 0) > 0,
    [serverItems]
  );
  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoadingCartItems && <LoadingSpinner className="!h-5 !w-5" />}
        {!isLoadingCartItems && hasContent && (
          <Flex direction="col" gap="md">
            <Flex direction="col" gap="md" className="p-2 w-full">
              {serverItems?.map((item) => {
                const product = products?.find(
                  (product) => product?._id === item.productId
                );
                const category = categories?.find(
                  (category) => category._id === product?.categoryId
                );
                return (
                  <div
                    key={item._id}
                    className="flex w-full flex-col md:flex-row gap-2 not-last:border-b not-last:p-2 hover:bg-gray-100"
                  >
                    <Flex
                      direction="row"
                      align="center"
                      justify="start"
                      gap="xl"
                      className="w-full "
                    >
                      <div className="relative h-16 w-16 flex-shrink-0">
                        <Image
                          src={product?.image ?? ""}
                          alt={product?.title ?? ""}
                          width={64}
                          height={64}
                          className="h-full w-full rounded-md object-contain"
                        />
                        <Badge className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full  text-xs font-medium text-white">
                          {item.quantity}
                        </Badge>
                      </div>
                      <Flex direction="col" gap="md" className="flex-1 min-w-0">
                        <h4 className="hidden md:block text-md font-medium truncate">
                          {product?.title}
                        </h4>
                        <Flex
                          direction="row"
                          align="center"
                          justify="start"
                          gap="md"
                        >
                          <Badge
                            style={{
                              backgroundColor:
                                categoryColors?.[category?.name ?? ""] ??
                                category?.color,
                            }}
                          >
                            {category?.name}
                          </Badge>
                          <Badge
                            className={
                              "bg-gray-100 text-gray-800 border-gray-100 hover:bg-gray-200 hover:border-gray-200"
                            }
                          >
                            {product?.packaging}
                          </Badge>
                        </Flex>
                        <div className="block md:hidden text-sm font-medium text-primary">
                          {displayMoney(
                            (product?.price ?? 0) * item.quantity,
                            false
                          )}
                        </div>
                      </Flex>
                      <div className="hidden md:block text-sm font-medium text-primary">
                        {displayMoney(
                          (product?.price ?? 0) * item.quantity,
                          false
                        )}
                      </div>
                    </Flex>
                    <h4 className="md:hidden text-md font-medium text-gray-900 truncate">
                      {product?.title}
                    </h4>
                  </div>
                );
              })}
            </Flex>
            {hasContent && <Separator />}

            {hasContent && (
              <div className="space-y-2 w-full">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium text-primary">
                    {displayMoney(totalPrice ?? 0, false)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Delivery Fee</span>
                  <span className="font-medium text-primary">
                    +{displayMoney(deliveryPrice, false)}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between text-base font-semibold">
                  <span>Total</span>
                  <span className="text-primary">
                    {displayMoney((totalPrice ?? 0) + deliveryPrice, false)}
                  </span>
                </div>
              </div>
            )}
          </Flex>
        )}
      </CardContent>
    </Card>
  );
}

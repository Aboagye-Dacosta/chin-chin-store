import {
  productByStoreSchema,
  ProductByStoreType,
} from "@/schema/product-by-store-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "../ui/form";
import ProductPickerDialog from "../product-picker-dialog";
import { Input } from "../ui/input";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useCallback, useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Flex } from "../ui/flex";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";
import { handleStatus } from "@/lib/handle-status";

export default function StocksProductRegistrationForm({
  initialValues,
}: Readonly<{
  initialValues?: ProductByStoreType;
}>) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const stores = useQuery(api.stores.getStores);
  const currentUser = useQuery(api.users.getCurrentUser);
  const verdor = useQuery(api.vendors.getVendorByUserId, {
    userId: currentUser?._id,
  });

  const addProductToStore = useMutation(api.productsByStore.addProductToStore);
  const updateProductQuantity = useMutation(
    api.productsByStore.updateProductQuantity
  );

  const form = useForm<ProductByStoreType>({
    resolver: zodResolver(productByStoreSchema),
    defaultValues: {
      productId: initialValues?.productId ?? "",
      storeId: initialValues?.storeId ?? "",
      quantity: initialValues?.quantity ?? 0,
    },
  });

  const {
    formState: { isDirty, isValid },
  } = form;

  const onSubmit = async (data: ProductByStoreType) => {
    if (!isDirty || !isValid) {
      return;
    }
    setIsSubmitting(true);
    try {
      if (initialValues) {
        await updateProductQuantity({
          storeId: data.storeId as Id<"stores">,
          productId: data.productId as Id<"products">,
          quantity: data.quantity,
        });

        toast.success("Product updated successfully");
      } else {
        await addProductToStore({
          storeId: data.storeId as Id<"stores">,
          productId: data.productId as Id<"products">,
          quantity: data.quantity,
        });
        toast.success("Product added successfully");
      }
    } catch (error) {
      handleStatus({ error });
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (currentUser?.role === "VENDOR") {
      form.setValue("storeId", verdor?.storeId ?? "");
    }
  }, [currentUser, verdor, form]);

  return (
    <div className="max-w-md w-full flex flex-col gap-3">
      <h1>Stocks Product Registration Form</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <Flex direction="col" gap="lg">
            {currentUser?.role === "SUPER_ADMIN" && (
              <FormField
                control={form.control}
                name="storeId"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormControl>
                      <Select
                        {...field}
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a store" />
                        </SelectTrigger>
                        <SelectContent>
                          {stores?.map((store) => (
                            <SelectItem key={store._id} value={store._id}>
                              {store.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="productId"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormControl>
                    <ProductPickerDialog
                      label="Choose Product"
                      value={field.value}
                      onChange={field.onChange}
                      btnVariant="outline"
                      className="w-full flex justify-start"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormControl>
                    <Input
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      type="number"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              disabled={isSubmitting}
              loading={isSubmitting}
              className="self-end"
            >
              Save Product
            </Button>
          </Flex>
        </form>
      </Form>
    </div>
  );
}

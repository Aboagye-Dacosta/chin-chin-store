import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { handleStatus } from "@/lib/handle-status";
import { cn } from "@/lib/utils";
import { productSchema, ProductSchema } from "@/schema/product-schema";
import { Product } from "@/types/convex-types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "convex/react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import ProductImageModelPickerDialog from "./product-image-model-picker";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";

interface CreateProductFormProps {
  defaultProduct?: Product;
}

export function CreateProductForm({
  defaultProduct,
}: Readonly<CreateProductFormProps>) {
  const categories = useQuery(api.categories.getCategories);
  const addProduct = useMutation(api.products.addProduct);
  const updateProduct = useMutation(api.products.updateProduct);
  const [isPending, setIsPending] = useState(false);

  const hasDefaultProduct = useMemo(
    () => Boolean(defaultProduct),
    [defaultProduct]
  );

  const computedDefaultProduct = useMemo(() => {
    if (!defaultProduct) {
      return undefined;
    }
    return {
      title: defaultProduct?.title,
      description: defaultProduct?.description,
      price: defaultProduct?.price,
      image: defaultProduct?.image,
      status: defaultProduct?.status,
      packaging: defaultProduct?.packaging,
      categoryId: defaultProduct?.categoryId,
      model: defaultProduct?.model,
    };
  }, [defaultProduct]);

  const form = useForm<ProductSchema>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      title: computedDefaultProduct?.title ?? "",
      description: computedDefaultProduct?.description ?? "",
      price: computedDefaultProduct?.price ?? 0,
      image: computedDefaultProduct?.image,
      model: computedDefaultProduct?.model ?? "",
      status: computedDefaultProduct?.status ?? "Active",
      packaging: computedDefaultProduct?.packaging ?? "Bag",
      categoryId: computedDefaultProduct?.categoryId,
    },
  });

  const onSubmit = async (data: ProductSchema) => {
    try {
      setIsPending(true);
      if (defaultProduct) {
        await updateProduct({
          productId: defaultProduct._id,
          title: data.title,
          description: data.description,
          price: data.price,
          image: data.image,
          model: data.model,
          status: data.status,
          packaging: data.packaging,
          categoryId: data.categoryId as Id<"categories">,
        });

        toast.success("Product updated successfully");
      } else {
        await addProduct({
          title: data.title,
          description: data.description,
          price: data.price,
          image: data.image,
          model: data.model,
          status: data.status,
          packaging: data.packaging,
          categoryId: data.categoryId as Id<"categories">,
        });

        toast.success("Product added successfully");
      }
    } catch (error) {
      handleStatus({ error });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6">
      <Form {...form}>
        <FormField
          name="title"
          render={({ field }) => {
            return (
              <FormItem>
                <FormLabel htmlFor="title">Product Title</FormLabel>
                <FormControl>
                  <Input
                    id="title"
                    type="text"
                    placeholder="Enter product title"
                    required
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            );
          }}
        />

        <FormField
          name="description"
          render={({ field }) => (
            <FormItem className="grid gap-2">
              <FormLabel htmlFor="description">Description</FormLabel>
              <FormControl>
                <Textarea
                  id="description"
                  placeholder="Enter product description"
                  required
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name="price"
          render={({ field }) => {
            return (
              <FormItem className="grid gap-2">
                <FormLabel htmlFor="price">Price</FormLabel>
                <FormControl>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...field}
                    value={field.value}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    required
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            );
          }}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            name="image"
            render={({ field }) => (
              <FormItem className="grid gap-2">
                <FormLabel htmlFor="image">Image URL</FormLabel>
                <FormControl>
                  <ProductImageModelPickerDialog
                    value={field.value}
                    onChange={field.onChange}
                    btnVariant="outline"
                    assetType="image"
                    label="Select product Image"
                    className="flex items-start justify-start"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="model"
            render={({ field }) => (
              <FormItem className="grid gap-2">
                <FormLabel htmlFor="image">Model URL</FormLabel>
                <FormControl>
                  <ProductImageModelPickerDialog
                    value={field.value}
                    onChange={field.onChange}
                    btnVariant="outline"
                    assetType="model"
                    label="Select product Model"
                    className="flex items-start justify-start"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div
          className={cn(
            "grid grid-cols-1 md:grid-cols-2 gap-6",
            hasDefaultProduct ? "md:grid-cols-1" : ""
          )}
        >
          <FormField
            name="status"
            render={({ field }) => (
              <FormItem className="grid gap-2">
                <FormLabel htmlFor="status">Status</FormLabel>
                <Select
                  {...field}
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger id="status" className="w-full">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />

          <FormField
            name="packaging"
            render={({ field }) => (
              <FormItem className="grid gap-2" hidden={hasDefaultProduct}>
                <FormLabel htmlFor="packaging">Packaging</FormLabel>
                <Select
                  {...field}
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger id="packaging" className="w-full">
                    <SelectValue placeholder="Select packaging" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Bag">Bag</SelectItem>
                    <SelectItem value="Can">Can</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
        </div>

        <FormField
          name="categoryId"
          render={({ field }) => (
            <FormItem className="grid gap-2" hidden={hasDefaultProduct}>
              <FormLabel htmlFor="categoryId">Category</FormLabel>
              <Select
                {...field}
                value={field.value}
                onValueChange={field.onChange}
              >
                <SelectTrigger id="categoryId" className="w-full">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories?.map((category) => (
                    <SelectItem key={category._id} value={category._id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full"
          loading={isPending}
          disabled={isPending}
        >
          {hasDefaultProduct ? "Update Product" : "Create Product"}
        </Button>
      </Form>
    </form>
  );
}

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo, useTransition } from "react";
import { productSchema, ProductSchema } from "@/schema/product-schema";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Product } from "@/types/convex-types";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { handleStatus } from "@/lib/handle-status";

interface CreateProductFormProps {
  defaultProduct?: Product;
}

export function CreateProductForm({
  defaultProduct,
}: Readonly<CreateProductFormProps>) {
  const stores = useQuery(api.stores.getStores);
  const categories = useQuery(api.categories.getCategories);
  const locations = useQuery(api.locations.getLocations);
  const addProduct = useMutation(api.products.addProduct);
  const [isPending, startTransition] = useTransition();

  const hasDefaultProduct = useMemo(
    () => Boolean(defaultProduct),
    [defaultProduct]
  );

  const computedDefaultProduct = useMemo(() => {
    if (!defaultProduct) {
      return undefined;
    }
    return {
      title: defaultProduct.title,
      description: defaultProduct.description,
      price: defaultProduct.price,
      stock: defaultProduct.stock,
      image: defaultProduct.image,
      status: defaultProduct.status,
      packaging: defaultProduct.packaging,
      categoryId: defaultProduct.categoryId,
      storeId: defaultProduct.storeId,
    };
  }, [defaultProduct]);

  const form = useForm<ProductSchema>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      title: computedDefaultProduct?.title ?? "",
      description: computedDefaultProduct?.description ?? "",
      price: computedDefaultProduct?.price ?? 0,
      stock: computedDefaultProduct?.stock ?? 0,
      image: computedDefaultProduct?.image ?? "",
      status: computedDefaultProduct?.status ?? "Active",
      packaging: computedDefaultProduct?.packaging ?? "Bag",
      categoryId: computedDefaultProduct?.categoryId,
      storeId: computedDefaultProduct?.storeId,
    },
  });

  const onSubmit = async (data: ProductSchema) => {
    console.log(data);
    startTransition(async () => {
      const response = await addProduct({
        title: data.title,
        description: data.description,
        price: data.price,
        stock: data.stock,
        image: data.image,
        status: data.status,
        packaging: data.packaging,
        categoryId: data.categoryId as Id<"categories">,
        storeId: data.storeId as Id<"stores">,
      });

      if (response.success) {
        form.reset();
      }

      handleStatus(response);
    });
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
          <FormField
            name="stock"
            render={({ field }) => {
              return (
                <FormItem className="grid gap-2">
                  <FormLabel htmlFor="stock">Stock</FormLabel>
                  <FormControl>
                    <Input
                      id="stock"
                      type="number"
                      placeholder="0"
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
        </div>

        <FormField
          name="image"
          render={({ field }) => (
            <FormItem className="grid gap-2">
              <FormLabel htmlFor="image">Image URL (Optional)</FormLabel>
              <FormControl>
                <Input
                  id="image"
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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

          <FormField
            name="storeId"
            render={({ field }) => (
              <FormItem className="grid gap-2" hidden={hasDefaultProduct}>
                <FormLabel htmlFor="storeId">Store</FormLabel>
                <Select
                  {...field}
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger id="storeId" className="w-full">
                    <SelectValue placeholder="Select store" />
                  </SelectTrigger>
                  <SelectContent>
                    {stores?.map((store) => (
                      <SelectItem key={store._id} value={store._id}>
                        {
                          locations?.find(
                            (location) => location._id === store.locationId
                          )?.name
                        }
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
        </div>

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

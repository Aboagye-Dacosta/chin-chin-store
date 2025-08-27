"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MapPin, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { Input } from "./ui/input";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Category } from "@/types/convex-types";
import { handleStatus } from "@/lib/handle-status";
import {
  productCategorySchema,
  ProductCategorySchemaType,
} from "@/schema/product-category-schema";

import { ColorPicker } from "./color-picker";

type Props = {
  title?: string;
  description?: string;
  defaultCategory?: Category;
  className?: string;
};

export default function CategoryForm({
  title = "Location",
  description = "Create or update a location for a store.",
  defaultCategory,
  className,
}: Readonly<Props>) {
  const [isPending, startTransition] = useTransition();
  const addCategory = useMutation(api.categories.addCategory);

  const form = useForm<ProductCategorySchemaType>({
    resolver: zodResolver(productCategorySchema),
    defaultValues: {
      name: defaultCategory?.name ?? "",
      color: defaultCategory?.color ?? "#000000",
    },
    mode: "onChange",
  });

  const isEditing = !!defaultCategory;

  const onSubmit = (values: ProductCategorySchemaType) => {
    startTransition(async () => {
      const response = await addCategory({
        name: values.name.trim().toLowerCase(),
        color: values.color,
      });
      if (response.success) {
        form.reset({
          name: "",
          color: "#000000",
        });
      }
      handleStatus(response);
    });
  };

  return (
    <Card className={cn("w-full max-w-xl", className)}>
      <CardHeader>
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-muted-foreground" />
          <CardTitle>{isEditing ? `Edit ${title}` : `New ${title}`}</CardTitle>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6"
            noValidate
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category name</FormLabel>
                  <Input placeholder="e.g. Coconut" {...field} />
                  <FormDescription>2–100 characters.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem className="min-w-[220px]">
                  <ColorPicker
                    value={field.value}
                    onChange={field.onChange}
                    label="Category color"
                    variant="outline"
                    className="w-full"
                  />
                  <FormDescription>HEX format (e.g., #2563eb).</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button type="submit" disabled={isPending} loading={isPending}>
                <Save className="mr-2 h-4 w-4" />
                {isEditing ? "Save changes" : "Create category"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

"use client";

import { useMemo, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
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
import { locationFormSchema } from "@/schema/location-schema";
import { Input } from "./ui/input";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Category } from "@/types/convex-types";
import { handleStatus } from "@/lib/handle-status";

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
  const schema = useMemo(() => locationFormSchema, []);
  type FormValues = z.infer<typeof schema>;
  const [isPending, startTransition] = useTransition();
  const addCategory = useMutation(api.categories.addCategory);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: defaultCategory?.name ?? "",
    },
    mode: "onChange",
  });

  const isEditing = !!defaultCategory;

  const onSubmit = (values: FormValues) => {
    startTransition(async () => {
      const response = await addCategory({
        name: values.name.trim().toLowerCase(),
      });
      if (response.success) {
        form.reset({
          name: "",
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
                  <FormDescription>2-100 characters.</FormDescription>
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

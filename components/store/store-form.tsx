"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { StoreIcon } from "lucide-react";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { storeFormSchema, StoreFormValues } from "@/schema/store-schema";
import { Store } from "@/types/convex-types";
import { Input } from "../ui/input";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";
import { handleStatus } from "@/lib/handle-status";

type Props = {
  title?: string;
  description?: string;
  className?: string;
  defaultValue?: Store;
};

export default function StoreForm({
  title = "Store",
  description = "Create or update a store. Location is optional.",
  className,
  defaultValue,
}: Readonly<Props>) {
  const locations = useQuery(api.locations.getLocations);
  const addStore = useMutation(api.stores.addStore);
  const updateStore = useMutation(api.stores.updateStore);
  const [isCreatingStore, setIsCreatingStore] = useState(false);

  const form = useForm<StoreFormValues>({
    resolver: zodResolver(storeFormSchema),
    defaultValues: {
      name: defaultValue?.name ?? "",
      locationId: defaultValue?.locationId ?? "",
      deliveryCharge: defaultValue?.deliveryCharge ?? 0,
    },
  });

  const onSubmit = async (values: StoreFormValues) => {
    setIsCreatingStore(true);
    try {
      if (defaultValue) {
        await updateStore({
          id: defaultValue._id,
          name: values.name.trim().toLowerCase(),
          locationId: values.locationId as Id<"locations">,
          deliveryCharge: values.deliveryCharge,
        });
        toast.success("Store updated successfully");
      } else {
        await addStore({
          name: values.name.trim().toLowerCase(),
          locationId: values.locationId as Id<"locations">,
          deliveryCharge: values.deliveryCharge,
        });
        toast.success("Store created successfully");
      }
      form.reset({
        name: "",
        locationId: "",
      });
    } catch (error) {
      handleStatus({ error });
    } finally {
      setIsCreatingStore(false);
    }
  };

  const hasDefaultValue = !!defaultValue;

  return (
    <Card
      className={cn("w-full max-w-xl border-none shadow-none p-0", className)}
    >
      <CardHeader>
        <div className="flex items-center gap-2">
          <StoreIcon className="h-5 w-5 text-muted-foreground" />
          <CardTitle>{title}</CardTitle>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Form {...form}>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Store name</FormLabel>
                  <Input placeholder="e.g. Downtown Market" {...field} />
                  <FormDescription>
                    Must be at least 2 characters and at most 100.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="locationId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a location" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations?.map((location) => (
                        <SelectItem key={location._id} value={location._id}>
                          {location.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Chose the location for the store
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="deliveryCharge"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Delivery Charge</FormLabel>
                  <Input
                    placeholder="e.g. 10"
                    {...field}
                    type="number"
                    step="0.01"
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                  <FormDescription>Must be at least 0.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                type="submit"
                disabled={isCreatingStore}
                loading={isCreatingStore}
                className="flex items-center gap-2"
              >
                {hasDefaultValue ? "Save changes" : "Create store"}
              </Button>
            </div>
          </Form>
        </form>
      </CardContent>
    </Card>
  );
}

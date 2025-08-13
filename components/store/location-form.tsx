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
import { Locations } from "@/lib/fetch/fetch-locations";
import { Input } from "../ui/input";
import { toast } from "sonner";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

type Props = {
  title?: string;
  description?: string;
  defaultLocation?: Locations[number] | null;
  className?: string;
};

export default function LocationForm({
  title = "Location",
  description = "Create or update a location for a store.",
  defaultLocation = null,
  className,
}: Readonly<Props>) {
  const schema = useMemo(() => locationFormSchema, []);
  type FormValues = z.infer<typeof schema>;
  const [isPending, startTransition] = useTransition();
  const addLocation = useMutation(api.locations.addLocation);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: defaultLocation?.name ?? "",
    },
    mode: "onChange",
  });

  const isEditing = !!defaultLocation;

  const onSubmit = (values: FormValues) => {
    startTransition(async () => {
      const response = await addLocation(values);
      if (response.success) {
        form.reset({
          name: "",
        });
        toast.success(response.message);
      }

      if (!response.success) {
        toast.error(response.message);
      }
    });

    if (!isEditing) {
      form.reset({
        name: "",
      });
    }
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
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Location name</FormLabel>
                  <Input
                    placeholder="e.g. Central Plaza"
                    aria-invalid={!!fieldState.error}
                    aria-describedby={
                      fieldState.error ? "loc-name-error" : undefined
                    }
                    {...field}
                  />
                  <FormDescription>2-100 characters.</FormDescription>
                  <FormMessage id="loc-name-error" />
                </FormItem>
              )}
            />
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button type="submit" disabled={isPending} loading={isPending}>
                <Save className="mr-2 h-4 w-4" />
                {isEditing ? "Save changes" : "Create location"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

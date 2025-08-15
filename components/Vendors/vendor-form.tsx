"use client";

import { memo, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";

import { createVendorSchema } from "@/schema/create-vendor-schema";
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
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MobileMoneyProvider, Vendor } from "@/types/convex-types";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";
import { Id } from "@/convex/_generated/dataModel";
import { handleStatus } from "@/lib/handle-status";

type CreateVendorFormData = z.infer<typeof createVendorSchema>;

const MOBILE_MONEY_PROVIDERS = [
  { value: "MTN", label: "MTN Mobile Money" },
  { value: "VODAFONE", label: "Vodafone Cash" },
  { value: "AIRTELTIGO", label: "AirtelTigo Money" },
] as const;

interface VendorFormProps {
  mode?: "create" | "update";
  initialData?: Vendor;
}

export const VendorForm = memo(
  ({ mode = "create", initialData }: Readonly<VendorFormProps>) => {
    const [isPending, startTransition] = useTransition();
    const isUpdateMode = mode === "update";

    const users = useQuery(api.users.getAllUsers);
    const stores = useQuery(api.stores.getStores);
    const addVendorMutation = useMutation(api.vendors.addVendor);

    const form = useForm<CreateVendorFormData>({
      resolver: zodResolver(createVendorSchema),
      defaultValues: {
        userId: initialData?.userId || "",
        storeId: initialData?.storeId || "",
      },
    });

    const handleSubmit = async (data: CreateVendorFormData) => {
      startTransition(async () => {
        const response = await addVendorMutation({
          userId: data.userId as Id<"users">,
          storeId: data.storeId as Id<"stores">,
          mobileMoneyAccounts: {
            provider: data.mobileMoneyAccounts.provider as MobileMoneyProvider,
            phoneNumber: data.mobileMoneyAccounts.phoneNumber,
          },
        });

        if (response?.success) {
          form.reset();
        }

        handleStatus(response!);
      });
    };

    return (
      <Card className="w-full border-none shadow-none">
        <CardHeader>
          <CardTitle>
            {isUpdateMode ? "Update Vendor" : "Create Vendor"}
          </CardTitle>
          <CardDescription>
            {isUpdateMode
              ? "Update vendor information and mobile money payment accounts"
              : "Set up a new vendor with mobile money payment accounts"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-6"
            >
              <FormField
                control={form.control}
                name="userId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>User ID</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select user" />
                        </SelectTrigger>
                        <SelectContent>
                          {users?.map((user) => (
                            <SelectItem key={user._id} value={user._id}>
                              {user.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormDescription>
                      The UUID of the user who will be the vendor
                      {isUpdateMode && " (cannot be changed)"}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="storeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Store ID</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select store" />
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
                    <FormDescription>
                      The UUID of the store associated with this vendor
                      {isUpdateMode && " (cannot be changed)"}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium">
                      Mobile Money Accounts
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {isUpdateMode
                        ? "Update payment accounts for receiving payments"
                        : "Add payment accounts for receiving payments"}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name={`mobileMoneyAccounts.provider`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Provider</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select provider" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {MOBILE_MONEY_PROVIDERS.map((provider) => (
                              <SelectItem
                                key={provider.value}
                                value={provider.value}
                              >
                                {provider.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Phone Number */}
                  <FormField
                    control={form.control}
                    name={`mobileMoneyAccounts.phoneNumber`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., 0241234567 or 233241234567"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isPending}
                loading={isPending}
              >
                {isUpdateMode ? "Update" : "Create"} Vendor
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    );
  }
);

export const UpdateVendorForm = memo(
  ({ initialData }: Readonly<Omit<VendorFormProps, "mode">>) => {
    return <VendorForm mode="update" initialData={initialData} />;
  }
);

export const CreateVendorForm = memo(() => {
  return <VendorForm mode="create" />;
});

"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useForm } from "react-hook-form";
import { ProfileSchema, profileSchema } from "@/schema/profile-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Textarea } from "./ui/textarea";
import { Container } from "./ui/contaner";
import { toast } from "sonner";
import { UploadButton } from "@/lib/uploadthing";
import { Flex } from "./ui/flex";
import { LoadingSpinner } from "./ui/loading-spinner";
import { useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Switch } from "./ui/switch";
import { Separator } from "./ui/separator";

export default function ProfileManagement() {
  const user = useQuery(api.users.getUserAddresses);
  const addAddress = useMutation(api.users.addAddress);
  const [isPending, startTransition] = useTransition();

  const form = useForm<ProfileSchema>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      deliveryAddress: user?.deliveryAddress ?? "",
      deliveryAddressNote: user?.deliveryAddressNote ?? "",
      isDefault: user?.isDefault ?? true,
    },
  });

  const onSubmit = (data: ProfileSchema) => {
    if (
      !form.formState.isDirty ||
      JSON.stringify(data) ===
        JSON.stringify({
          deliveryAddress: user?.deliveryAddress,
          deliveryAddressNote: user?.deliveryAddressNote,
          isDefault: user?.isDefault,
        })
    )
      return;

    startTransition(async () => {
      await addAddress(data);
    });
  };

  useEffect(() => {
    if (user) {
      form.setValue("deliveryAddress", user.deliveryAddress);
      form.setValue("deliveryAddressNote", user.deliveryAddressNote);
      form.setValue("isDefault", user.isDefault);
    }
  }, [user]);

  return (
    <Container>
      <Card className="w-full shadow-none border-none">
        <CardHeader>
          <CardTitle>Delivery Address</CardTitle>
          <CardDescription>Your delivery address information</CardDescription>
        </CardHeader>
        <Separator />
        <CardContent className="flex flex-col md:flex-row justify-start items-start gap-8 w-full">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-[24px]"
            >
              <FormField
                control={form.control}
                name="deliveryAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Delivery Address</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Block A, first floor"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="deliveryAddressNote"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address Note</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="anything we should know about the delivery address"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="isDefault"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Is Default</FormLabel>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="ml-auto"
                size="lg"
                disabled={isPending}
                loading={isPending}
              >
                Save Profile
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </Container>
  );
}

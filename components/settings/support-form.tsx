import { Flex } from "../ui/flex";
import { Card, CardContent } from "../ui/card";
import { Input } from "../ui/input";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormControl,
} from "../ui/form";
import { useForm } from "react-hook-form";
import { supportSchema, SuppportType } from "@/schema/support-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useCallback, useEffect, useState } from "react";
import { Button } from "../ui/button";
import { toast } from "sonner";

export const SupportForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const support = useQuery(api.support.getSupport);
  const addSupport = useMutation(api.support.addSupport);
  const form = useForm<SuppportType>({
    resolver: zodResolver(supportSchema),
    defaultValues: {
      email: support?.email ?? "",
      phone: support?.phone ?? "",
      address: support?.address ?? "",
      operationHours: support?.operationHours ?? "",
    },
  });

  const {
    control,
    formState: { isDirty, isValid },
  } = form;

  const saveSupport = useCallback(
    async (data: SuppportType) => {
      try {
        setIsSubmitting(true);
        await addSupport(data);
        toast.success("Support contact saved");
      } catch (err) {
        toast.error(`Could not save suppor contact: ${err}`);
      } finally {
        setIsSubmitting(false);
      }
    },
    [setIsSubmitting, addSupport]
  );

  const onSubmit = (data: SuppportType) => {
    const existing = {
      email: support?.email,
      phone: support?.phone,
      address: support?.address,
      operationHours: support?.operationHours,
    };
    const isEqualExisting = JSON.stringify(existing) === JSON.stringify(data);
    if (!isDirty || !isValid || isEqualExisting) return;
    saveSupport(data);
  };

  useEffect(() => {
    if (support) {
      form.reset(support);
    }
  }, [support,form]);

  return (
    <Flex direction="col" gap="lg" className="w-full h-full">
      <h1>Support Form</h1>
      <Card className="max-w-5xl w-full">
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
            <Form {...form}>
              <Flex direction="col" gap="lg" justify="end" className="w-full">
                <FormField
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="w-full"
                          placeholder="eg. support@chipchin.com"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name="phone"
                  control={control}
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="w-full"
                          placeholder="eg. +233 244 567 890"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name="address"
                  control={control}
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="w-full"
                          placeholder="eg. 123 Main St, Anytown, Ghana"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name="operationHours"
                  control={control}
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Operation Hours</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="w-full"
                          placeholder="eg. Monday - Friday: 9:00 AM - 5:00 PM"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Flex className="w-full justify-end">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    loading={isSubmitting}
                  >
                    Save Support Contact
                  </Button>
                </Flex>
              </Flex>
            </Form>
          </form>
        </CardContent>
      </Card>
    </Flex>
  );
};

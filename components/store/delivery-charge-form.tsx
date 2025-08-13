import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  deliveryChargeFormSchema,
  DeliveryChargeFormSchemaType,
} from "@/schema/delivery-charge";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTransition } from "react";
import { DeliveryCharge } from "@/types/convex-types";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { handleStatus } from "@/lib/handle-status";

export function DeliveryChargeForm({
  storeId,
  defaultDeliveryCharge,
}: Readonly<{
  defaultDeliveryCharge?: DeliveryCharge;
  storeId: string;
}>) {
  const [isPending, startTransition] = useTransition();
  const isEditing = defaultDeliveryCharge !== undefined;
  const addDeliveryCharge = useMutation(api.deliveryCharge.addDeliveryCharge);
  const updateDeliveryCharge = useMutation(
    api.deliveryCharge.updateDeliveryCharge
  );

  const form = useForm<DeliveryChargeFormSchemaType>({
    resolver: zodResolver(deliveryChargeFormSchema),
    defaultValues: {
      amount: defaultDeliveryCharge?.amount ?? 0,
    },
    mode: "onChange",
  });

  const onSubmit = (data: DeliveryChargeFormSchemaType) => {
    startTransition(async () => {
      if (isEditing) {
        const response = await updateDeliveryCharge({
          id: defaultDeliveryCharge._id,
          amount: data.amount,
          storeId: storeId as Id<"stores">,
        });
        if (response.success) {
          form.reset();
        }
        handleStatus(response);
      } else {
        const response = await addDeliveryCharge({
          amount: data.amount,
          storeId: storeId as Id<"stores">,
        });
        if (response.success) {
          form.reset();
        }
        handleStatus(response);
      }
    });
  };
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input {...field} type="number" onChange={(e) => field.onChange(Number(e.target.value))} placeholder="Amount" />
              </FormControl>
              <FormDescription>Amount in Ghana Cedis</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button type="submit" disabled={isPending} loading={isPending}>
            {isEditing ? "Saving..." : "Create"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

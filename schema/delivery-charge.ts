import { z } from "zod";

export const deliveryChargeFormSchema = z.object({
    amount: z.number().min(1, "Amount is required"),
});

export type DeliveryChargeFormSchemaType = z.infer<typeof deliveryChargeFormSchema>;
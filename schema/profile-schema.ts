import { z } from "zod";

export const profileSchema = z.object({
  deliveryAddress: z
    .string()
    .min(5, "Delivery address must be at least 5 characters long"),
  deliveryAddressNote: z.string().optional(),
  isDefault: z.boolean(),
});

export type ProfileSchema = z.infer<typeof profileSchema>;

import { z } from "zod";

export const locationFormSchema = z.object({
  name: z
    .string()
    .min(2, "Location name must be at least 2 characters")
    .max(100, "Location name must be at most 100 characters"),
});

export type LocationFormValues = z.infer<typeof locationFormSchema>;

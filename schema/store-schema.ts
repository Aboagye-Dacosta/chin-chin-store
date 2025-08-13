import { z } from "zod"

export const storeFormSchema = z
  .object({
    name: z
      .string({ required_error: "Store name is required" })
      .min(2, "Store name must be at least 2 characters")
      .max(100, "Store name must be at most 100 characters"),
    locationId: z.string().min(1, "Location is required"),
  })
 

  export type StoreFormValues = z.infer<typeof storeFormSchema>
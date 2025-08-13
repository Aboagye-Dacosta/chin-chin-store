import { z } from "zod";

export const productCategorySchema = z.object({
  name: z
    .string()
    .min(2, "Category name must be at least 2 characters")
    .max(100, "Category name must be at most 100 characters"),
});

export type ProductCategorySchema = z.infer<typeof productCategorySchema>;

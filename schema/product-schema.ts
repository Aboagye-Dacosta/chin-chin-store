import { z } from "zod";

export const productSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters long"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters long"),
  price: z.number().min(0, "Price must be a positive number"),
  stock: z.number().int().min(0, "Stock must be a non-negative integer"),
  image: z.string().url("Image must be a valid URL").optional(),
  model: z.string().url("Model must be a valid URL").optional(),
  status: z.enum(["Active", "Inactive"]).default("Active"),
  packaging: z.enum(["Bag", "Can"]).default("Bag"),
  categoryId: z.string().min(1, "Category ID is required"),
  storeId: z.string().min(1, "Store ID is required"),
});

export type ProductSchema = z.infer<typeof productSchema>;



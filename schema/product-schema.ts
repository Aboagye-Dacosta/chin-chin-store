import { z } from "zod";

export const productSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters long"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters long"),
  price: z.number().min(0, "Price must be a positive number"),
  image: z.string().min(1, "Image is required"),
  model: z.string().optional(),
  status: z.enum(["Active", "Inactive"]).default("Active"),
  packaging: z.enum(["Bag", "Can"]).default("Bag"),
  categoryId: z.string().min(1, "Category ID is required"),
});

export type ProductSchema = z.infer<typeof productSchema>;

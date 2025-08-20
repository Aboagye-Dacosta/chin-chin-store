import { z } from "zod";

export const productByStoreSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  storeId: z.string().min(1, "Store ID is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
});

export type ProductByStoreType = z.infer<typeof productByStoreSchema>;

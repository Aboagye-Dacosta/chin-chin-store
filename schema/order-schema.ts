import { z } from "zod";

export const orderSchema = z.object({
    userId: z.string().min(1, "User ID is required"),
    vendorId: z.string().min(1, "Vendor ID is required"),
    items: z.array(z.object({
        productId: z.string().min(1, "Product ID is required"),
        quantity: z.number().min(1, "Quantity must be at least 1"),
    })),
    total: z.number().min(1, "Total must be at least 1"),
    deliveryAddressLabel: z.string().min(1, "Please enter a delivery address label"),
    deliveryCity: z.string().min(1, "Please enter a delivery city"),
    deliveryNote: z.string().optional(),
});

export type OrderFormData = z.infer<typeof orderSchema>;
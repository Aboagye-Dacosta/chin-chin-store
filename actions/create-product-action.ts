"use server";

import { ProductSchema } from "@/schema/product-schema";
import { prisma } from "@/lib/prisma/client";
import { revalidateTag } from "next/cache";

export async function createProductAction(data: ProductSchema) {
  try {
    const response = await prisma.product.create({
      data,
    });
    console.log(response);
    revalidateTag("products");
    revalidateTag("stores");
    return { success: true, message: "SUCCESS: Product created successfully." };
  } catch (error) {
    console.error("Failed to create product:", error);
    return { success: false, message: "ERROR: An unexpected error occurred." };
  }
}

"use server";

import { StoreFormValues } from "@/schema/store-schema";
import { prisma } from "@/lib/prisma/client";
import { revalidateTag } from "next/cache";

export async function createStoreAction(data: StoreFormValues) {
  try {
    const existingStore = await prisma.store.findUnique({
      where: {
        name: data.name,
      },
    });

    if (existingStore) {
      return {
        success: false,
        message: "Store already exists.",
      };
    }
    await prisma.store.create({
      data: {
        name: data.name,
        locationId: data.locationId,
      },
    });
    revalidateTag("stores");
    return {
      success: true,
      message: "Store created successfully.",
    };
  } catch (error) {
    console.error("Error creating store:", error);
    return {
      success: false,
      message: "Failed to create store.",
    };
  }
}

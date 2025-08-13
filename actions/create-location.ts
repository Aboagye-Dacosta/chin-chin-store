"use server";

import { LocationFormValues } from "@/schema/location-schema";
import { prisma } from "@/lib/prisma/client";
import { revalidateTag } from "next/cache";

export async function createLocationAction(data: LocationFormValues) {
  try {
    const existingLocation = await prisma.location.findUnique({
      where: {
        name: data.name,
      },
    });
    
    if (existingLocation) {
      return {
        success: false,
        message: "Location already exists.",
      };
    }
    await prisma.location.create({
      data,
    });
    revalidateTag("locations");
    return {
      success: true,
      message: "Location created successfully.",
    };
  } catch (error) {
    console.error("Failed to create location:", error);
    return { success: false, message: "An unexpected error occurred." };
  }
}

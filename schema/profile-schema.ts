import { z } from "zod";

export const profileSchema = z.object({
  phoneNumber: z.string().min(10, "Phone number must be at least 10 characters long"),
  address: z.string().min(5, "Address must be at least 5 characters long"),
  bio: z.string().min(10, "Bio must be at least 10 characters long"),
  locationId: z.string().min(1, "Location is required"),
  imageUrl: z.string().url("Invalid image URL"),
  userId: z.string().min(1, "User ID is required"),
});

export type ProfileSchema = z.infer<typeof profileSchema>;

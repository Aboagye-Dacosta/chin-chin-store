import { z } from "zod";

export const supportSchema = z.object({
  email: z.string().email(),
  phone: z.string().min(10).max(15),
  address: z.string().min(5),
  operationHours: z.string(),
});

export type SuppportType = z.infer<typeof supportSchema>;

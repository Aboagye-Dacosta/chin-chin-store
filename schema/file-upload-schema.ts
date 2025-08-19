import { z } from "zod";

export const fileUploadSchema = z.object({
  name: z.string().min(2, "Name is required").max(100, "Name is too long"),
  file: z.instanceof(File),
  isModel: z.boolean().optional().default(false),
});

export type FileUploadType = z.infer<typeof fileUploadSchema>;

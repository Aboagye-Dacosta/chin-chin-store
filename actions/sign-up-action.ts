"use server";

import { ActionState } from "@/types/action-types";
import { ResponseState } from "@/types/response-types";
import { z } from "zod";
import { loadEnv } from "@/lib/load-env";

const signUpSchema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(6),
});

export type SignUpSchema = z.infer<typeof signUpSchema>;

export const signUpAction = async (
  _prev: ActionState<SignUpSchema>,
  formData: FormData
): Promise<ActionState<SignUpSchema>> => {
  const rawData = {
    name: (formData.get("name") as string)?.trim(),
    email: (formData.get("email") as string)?.trim(),
    password: (formData.get("password") as string)?.trim(),
  };

  console.log(rawData);

  const validatedData = signUpSchema.safeParse(rawData);

  if (!validatedData.success) {
    return {
      error: validatedData.error.flatten().fieldErrors,
    };
  }

  const baseUrl = loadEnv("NEXTAUTH_URL");

  const response = await fetch(`${baseUrl}/api/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(rawData),
    next: {
      tags: ["user"],
    },
  });

  if (!response.ok) {
    console.error((response as ResponseState).message);
    return {};
  }

  return {
    success: true,
  };
};

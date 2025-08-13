"use server";

import { loadEnv } from "@/lib/load-env";
import { ActionState } from "@/types/action-types";
import { ResponseState } from "@/types/response-types";
import { redirect } from "next/navigation";
import { z } from "zod";

const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export type SignInSchema = z.infer<typeof signInSchema>;

export const signInAction = async (
  _prev: ActionState<SignInSchema>,
  formData: FormData
): Promise<ActionState<SignInSchema>> => {
  const rawData = {
    email: (formData.get("email") as string)?.trim(),
    password: (formData.get("password") as string)?.trim(),
  };

  const validatedData = signInSchema.safeParse(rawData);

  if (!validatedData.success) {
    return {
      error: validatedData.error.flatten().fieldErrors,
    };
  }

  const response = await fetch(`${loadEnv("NEXTAUTH_URL")}/api/signin`, {
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

  redirect("/");

  return {
    success: true,
  };
};

"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useActionState } from "react";
import { signUpAction, SignUpSchema } from "@/actions/sign-up-action";
import { ActionState } from "@/types/action-types";
import { FormRow } from "@/components/ui/form-row";
import { SubmitButton } from "@/components/submit-button";

const initialState = {} as ActionState<SignUpSchema>;

export default function SignUpPage() {
  const [state, action] = useActionState(signUpAction, initialState);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Sign Up</CardTitle>
          <p className="text-muted-foreground">Create your ChipMart account</p>
        </CardHeader>
        <CardContent>
          <form action={action} className="space-y-4">
            <FormRow
              htmlFor="name"
              label="Name"
              error={state.error?.name?.at(0)}
            >
              <Input id="name" type="text" name="name" value={state?.data?.name} required />
            </FormRow>

            <FormRow
              htmlFor="email"
              label="Email"
              error={state.error?.email?.at(0)}
            >
              <Input
                id="email"
                type="email"
                name="email"
                value={state?.data?.email}
                required
              />
            </FormRow>

            <FormRow
              htmlFor="password"
              label="Password"
              error={state.error?.password?.at(0)}
            >
              <Input
                id="password"
                type="password"
                name="password"
                value={state?.data?.password}
                required
                minLength={6}
              />
            </FormRow>

            <SubmitButton>Sign Up</SubmitButton>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                href="/auth/signin"
                className="font-medium text-primary hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

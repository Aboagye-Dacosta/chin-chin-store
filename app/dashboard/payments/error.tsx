"use client";

import { Button } from "@/components/ui/button";
import { ConvexError } from "convex/values";
import { useRouter } from "next/navigation";

type AdminErrorPageProps = {
  error:  Error | ConvexError<string>;
  reset: () => void;
};

export default function AdminErrorPage({ error, reset }: Readonly<AdminErrorPageProps>) {
  const router = useRouter();
  const errorMessage =
    error instanceof ConvexError
      ? error.data
      : error.message;
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-4">
      <h2 className="text-2xl font-bold">Something went wrong!</h2>
      <p className="text-destructive">{errorMessage}</p>
      <div className="flex items-center gap-4">
        <Button onClick={() => reset()} variant="outline">
          Try again
        </Button>
        <Button onClick={() => router.back()}>Go back</Button>
      </div>
    </div>
  );
}

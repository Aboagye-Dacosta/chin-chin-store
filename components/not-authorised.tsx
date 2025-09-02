"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function NotAuthorised() {
  const router = useRouter();
  return (
    <div className="flex items-center justify-center h-full">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Not Authorised</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p>You are not authorised to view this page.</p>
          <Button onClick={() => router.back()} className="mt-4">
            Go Back
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

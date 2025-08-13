"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { XCircle } from "lucide-react"

export default function CancelPage() {
  const params = useSearchParams()
  const router = useRouter()
  const orderId = params.get("orderId") || ""

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-red-600" />
            <CardTitle>Payment canceled</CardTitle>
          </div>
          <CardDescription>{"No charges were made. You can try again or choose another method."}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground">
            {"Order ID: "}
            <span className="font-medium text-foreground">{orderId}</span>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push("/checkout/payment?orderId=" + orderId)}>
              Try again
            </Button>
            <Button onClick={() => router.back()}>Go back</Button>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}

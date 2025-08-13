"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"

export default function SuccessPage() {
  const params = useSearchParams()
  const router = useRouter()
  const sessionId = params.get("session_id") || ""
  const orderId = params.get("orderId") || ""

  const [ready, setReady] = useState(false)
  useEffect(() => {
    // In production, you should verify the session on your server or rely on the webhook.
    setReady(true)
  }, [])

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <CardTitle>Payment successful</CardTitle>
          </div>
          <CardDescription>{"Thank you! Your card payment has been processed."}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm text-muted-foreground">
            {"Order ID: "}
            <span className="font-medium text-foreground">{orderId}</span>
          </div>
          <div className="text-xs text-muted-foreground">
            {"Stripe session: "}
            <span className="font-mono">{sessionId}</span>
          </div>
          <div className="pt-4">
            <Button onClick={() => router.push("/")} disabled={!ready}>
              Continue shopping
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}

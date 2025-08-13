import { CheckCircle, XCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { LoadingSpinner } from "./ui/loading-spinner";
import { Payment } from "@prisma/client";

export const PaymentStatusAlert = ({ payment }: { payment: Payment; }) => {
  const status = payment.status

  if (status === "PAID") {
    return (
      <Alert>
        <CheckCircle className="h-4 w-4" />
        <AlertTitle>Payment successful</AlertTitle>
        <AlertDescription className="text-sm">Thank you! Your payment was completed.</AlertDescription>
      </Alert>
    )
  }

  if (status === "FAILED") {
    return (
      <Alert variant="destructive">
        <XCircle className="h-4 w-4" />
        <AlertTitle>Payment failed</AlertTitle>
        <AlertDescription className="text-sm">
          The transaction could not be completed. Please try again or choose another method.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Alert>
      <LoadingSpinner className="!h-4 !w-4" />
      <AlertTitle>Awaiting confirmation</AlertTitle>
      <AlertDescription className="text-sm">
        Approve the request on your phone to complete the payment.
      </AlertDescription>
    </Alert>
  )
}
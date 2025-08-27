"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  CreditCard,
  Smartphone,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Calendar,
  DollarSign,
} from "lucide-react";
import { Payment } from "@/types/convex-types";
import { Flex } from "../ui/flex";

// Type definitions based on your schema
export type PaymentMethod = "MOBILE_MONEY" | "PAYMENT_ON_DELIVERY" | "CARD";
export type PaymentNetwork = "MTN" | "VODAFONE" | "AIRTELTIGO" | "ORANGE";

interface PaymentDetailCardProps {
  payment: Payment | null;
}

export function PaymentDetailCard({ payment }: PaymentDetailCardProps) {
  const getMethodIcon = (method: PaymentMethod | undefined) => {
    if (!method) return <DollarSign className="h-4 w-4" />;
    switch (method) {
      case "MOBILE_MONEY":
        return <Smartphone className="h-4 w-4" />;
      case "CARD":
        return <CreditCard className="h-4 w-4" />;
      case "PAYMENT_ON_DELIVERY":
        return <Truck className="h-4 w-4" />;
      default:
        return <DollarSign className="h-4 w-4" />;
    }
  };

  const getStatusIcon = (status: Payment["status"] | undefined) => {
    if (!status) return <Clock className="h-4 w-4 text-gray-600" />;
    switch (status) {
      case "PAID":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "PENDING":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case "AWAITING_CONFIRMATION":
        return <AlertCircle className="h-4 w-4 text-blue-600" />;
      case "FAILED":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "CANCELLED":
        return <XCircle className="h-4 w-4 text-gray-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: Payment["status"] | undefined) => {
    if (!status) return "bg-gray-100 text-gray-800 border-gray-200";
    switch (status) {
      case "PAID":
        return "bg-green-100 text-green-800 border-green-200";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "AWAITING_CONFIRMATION":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "FAILED":
        return "bg-red-100 text-red-800 border-red-200";
      case "CANCELLED":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getMethodLabel = (method: PaymentMethod | undefined) => {
    if (!method) return "Payment method unknown";
    switch (method) {
      case "MOBILE_MONEY":
        return "Mobile Money";
      case "CARD":
        return "Card Payment";
      case "PAYMENT_ON_DELIVERY":
        return "Payment on Delivery";
      default:
        return method;
    }
  };

  const getStatusDescription = (status: Payment["status"] | undefined) => {
    if (!status) return "Payment status unknown";
    switch (status) {
      case "PAID":
        return "Payment has been successfully processed";
      case "PENDING":
        return "Payment is awaiting processing";
      case "AWAITING_CONFIRMATION":
        return "Payment is currently being processed";
      case "FAILED":
        return "Payment processing failed";
      case "CANCELLED":
        return "Payment was cancelled";
      default:
        return "Payment status unknown";
    }
  };

  return (
    <TooltipProvider>
      <Card className="w-full transition-shadow duration-200">
        <CardHeader className="">
          <div className="flex items-center justify-between">
            <Flex direction="col" gap="md">
              <CardTitle className="flex items-center gap-2">
                Payment Details
              </CardTitle>
              <CardDescription className="flex items-center gap-2">
                {getMethodIcon(payment?.method)}
                {getMethodLabel(payment?.method)}
              </CardDescription>
            </Flex>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge
                  variant="outline"
                  className={`flex items-center gap-1 ${getStatusColor(payment?.status)}`}
                >
                  {getStatusIcon(payment?.status)}
                  {payment?.status ?? ""}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>{getStatusDescription(payment?.status)}</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Created
              </span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="cursor-help">
                    {formatDate(payment?.createdAt ?? "")}
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{payment?.createdAt}</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}

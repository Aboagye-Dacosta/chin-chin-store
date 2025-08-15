import { z } from "zod";

export const PaymentSchema = z.object({
  orderId: z.string(),
  vendorId: z.string(),
  amount: z.number(),
  currency: z.string(),
  method: z.enum(["MOBILE_MONEY", "PAYMENT_ON_DELIVERY", "CARD"]),
  status: z.enum([
    "PENDING",
    "PAID",
    "FAILED",
    "REFUNDED",
    "AWAITING_CONFIRMATION",
  ]),
  phoneNumber: z.string().optional(),
  mobileNetwork: z.enum(["MTN", "AIRTELTIGO", "TELECEL"]).optional(),
  transactionId: z.string().optional(),
  transactionReference: z.string().optional(),
  metadata: z.any().optional(),
  paymentGatewaySettingsId: z.string(),
});

export type PaymentSchemaType = z.infer<typeof PaymentSchema>;

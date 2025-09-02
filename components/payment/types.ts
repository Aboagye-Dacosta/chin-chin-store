import { NetworkCode } from "@/constants/payment-constants";

export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";
export type PaymentMethod = "MOBILE_MONEY" | "PAYMENT_ON_DELIVERY";

export type Payment = {
  id: string;
  orderId: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  paymentGatewaySettingsId: string;
  transactionId?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PaymentGatewaySettings = {
  id: string;
  name: string;
  logo: string;
  supportedMethods: PaymentMethod[];
  supportedNetworks?: NetworkCode[];
};

import { unstable_cache } from "next/cache";
import { prisma } from "../prisma/client";

const loadPaymentSettings = async () => {
  const paymentSettings = prisma.paymentGatewaySettings.findMany();
  return paymentSettings;
};

export const fetchPaymentSettings = unstable_cache(
  loadPaymentSettings,
  ["payment-settings"],
  {
    tags: ["payment-settings"],
    revalidate: 60 * 60 * 24,
  }
);

export type PaymentSettings = Awaited<ReturnType<typeof loadPaymentSettings>>;

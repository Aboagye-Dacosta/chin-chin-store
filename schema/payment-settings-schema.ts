import { z } from "zod";

export const paymentGatewaySettingsSchema = z.object({
  isActive: z.boolean(),
  name: z.string(),
  environment: z.enum(["TEST", "LIVE"]),
  apiKey: z.string(),
  apiSecret: z.string(),
  webhookSecret: z.string().optional(),
  supportedMethods: z.array(z.enum(["MOBILE_MONEY", "CARD"])),
  supportedNetworks: z.array(z.enum(["MTN", "AIRTELTIGO", "TELECEL"])),
});

export type PaymentGatewaySettings = z.infer<typeof paymentGatewaySettingsSchema>;

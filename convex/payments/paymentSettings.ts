import { query } from "../_generated/server";
import { decryptSecret } from "../paymentGateway";

export const paymentSettings = query({
  handler: async (ctx) => {
    const settings = await ctx.db.query("paymentGatewaySettings").first();

    if (!settings) {
      return null;
    }

    const decryptedApiKey = await decryptSecret(
      settings.apiKey,
      `${settings.name}:${settings.environment}`
    );

    const decryptedApiSecret = await decryptSecret(
      settings.apiSecret,
      `${settings.name}:${settings.environment}`
    );

    const decryptedWebhookSecret = settings.webhookSecret
      ? await decryptSecret(
          settings.webhookSecret,
          `${settings.name}:${settings.environment}`
        )
      : undefined;

    return {
      ...settings,
      apiKey: decryptedApiKey,
      apiSecret: decryptedApiSecret,
      webhookSecret: decryptedWebhookSecret,
    };
  },
});
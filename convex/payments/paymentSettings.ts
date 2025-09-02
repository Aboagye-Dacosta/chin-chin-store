/**
 * Functions for retrieving payment settings.
 */
import { query } from "../_generated/server";
import { decryptSecret } from "../paymentGateway";

/**
 * Retrieves payment gateway settings and decrypts sensitive information.
 *
 * @returns {object|null} The decrypted payment gateway settings, or null if not found.
 */
export const paymentSettings = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const user = await ctx.db.query("users").withIndex("byClerkId", (q) => q.eq("clerkId", identity?.subject)).first()
    if (user?.role !== "SUPER_ADMIN") throw new Error("you are not authorized to access this data")
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
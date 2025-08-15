import { internalQuery, mutation } from "./_generated/server";
import { v } from "convex/values";
import sodium from "libsodium-wrappers";
import { PaymentMethod, PaymentNetwork } from "./schema";

const METHODS = ["MOBILE_MONEY", "PAYMENT_ON_DELIVERY", "CARD"] as const;
const NETWORKS = ["MTN", "AIRTELTIGO", "TELECEL"] as const;

function parseAdminEmails(): string[] {
  return (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

function requireEnv(name: string): string {
  const val = process.env[name];
  if (!val) throw new Error(`${name} not set`);
  return val;
}

function getKeys(): Uint8Array[] {
  const raw = requireEnv("ENC_KEYS_B64");
  const arr = raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (arr.length === 0) throw new Error("ENC_KEYS_B64 has no keys");
  return arr.map((b64) =>
    sodium.from_base64(b64, sodium.base64_variants.ORIGINAL)
  );
}

async function encryptSecret(
  plaintext: string,
  aad: string,
  key: Uint8Array,
  keyVersion: number
) {
  const nonce = sodium.randombytes_buf(
    sodium.crypto_aead_xchacha20poly1305_ietf_NPUBBYTES
  );
  const ct = sodium.crypto_aead_xchacha20poly1305_ietf_encrypt(
    sodium.from_string(plaintext),
    sodium.from_string(aad),
    null,
    nonce,
    key
  );
  return {
    data: sodium.to_base64(ct, sodium.base64_variants.ORIGINAL),
    nonce: sodium.to_base64(nonce, sodium.base64_variants.ORIGINAL),
    v: keyVersion,
  };
}

export const createPaymentGatewaySetting = mutation({
  args: {
    name: v.string(),
    environment: v.union(v.literal("TEST"), v.literal("LIVE")),
    apiKey: v.string(),
    apiSecret: v.string(),
    webhookSecret: v.optional(v.string()),
    supportedMethods: v.array(PaymentMethod),
    supportedNetworks: v.array(PaymentNetwork),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const admins = parseAdminEmails();
    const email = identity.email?.toLowerCase();
    if (!email || !admins.includes(email)) throw new Error("Unauthorized");

    const hasMoMo = args.supportedMethods.includes("MOBILE_MONEY");
    if (hasMoMo && args.supportedNetworks.length === 0) {
      throw new Error("MOBILE_MONEY requires at least one supported network");
    }
    if (!hasMoMo && args.supportedNetworks.length > 0) {
      throw new Error(
        "supportedNetworks should be empty when MOBILE_MONEY is not enabled"
      );
    }

    // --- Prevent duplicate (name + environment)
    const dup = await ctx.db
      .query("paymentGatewaySettings")
      .filter((q) =>
        q.and(
          q.eq(q.field("name"), args.name),
          q.eq(q.field("environment"), args.environment)
        )
      )
      .first();
    if (dup)
      throw new Error("Gateway with this name and environment already exists");

    await sodium.ready;
    const keys = getKeys();
    const activeKey = keys[0];
    if (
      activeKey.length !== sodium.crypto_aead_xchacha20poly1305_ietf_KEYBYTES
    ) {
      throw new Error("Active key must be 32 bytes");
    }
    const keyVersion = 0;
    const aad = `${args.name}:${args.environment}`;

    // --- Encrypt secrets
    const encApiKey = await encryptSecret(
      args.apiKey,
      aad,
      activeKey,
      keyVersion
    );
    const encApiSecret = await encryptSecret(
      args.apiSecret,
      aad,
      activeKey,
      keyVersion
    );
    const encWebhookSec = args.webhookSecret
      ? await encryptSecret(args.webhookSecret, aad, activeKey, keyVersion)
      : undefined;

    // --- Insert
    const now = new Date().toISOString();
    const id = await ctx.db.insert("paymentGatewaySettings", {
      name: args.name,
      environment: args.environment,
      apiKey: encApiKey,
      apiSecret: encApiSecret,
      webhookSecret: encWebhookSec,
      supportedMethods: args.supportedMethods,
      supportedNetworks: args.supportedNetworks,
      isActive: args.isActive,
      createdAt: now,
      updatedAt: now,
    });

    return { success: true, id };
  },
});

export const decryptSecret = async function (
  blob: { data: string; nonce: string; v: number },
  aad: string
): Promise<string> {
  await sodium.ready;
  const keys = getKeys();
  const key = keys[blob.v];
  if (!key) throw new Error(`No key for version ${blob.v}`);
  const ct = sodium.from_base64(blob.data, sodium.base64_variants.ORIGINAL);
  const nonce = sodium.from_base64(blob.nonce, sodium.base64_variants.ORIGINAL);
  const pt = sodium.crypto_aead_xchacha20poly1305_ietf_decrypt(
    null,
    ct,
    sodium.from_string(aad),
    nonce,
    key
  );
  return sodium.to_string(pt);
};

export const getPaymentGatewaySettings = internalQuery({
  handler: async (ctx) => {
    const settings = await ctx.db
      .query("paymentGatewaySettings")
      .first();

    if (!settings) {
      throw new Error("Payment gateway settings not found");
    }

    const { apiKey, apiSecret, webhookSecret, ...rest } = settings;

    const decryptedApiKey = await decryptSecret(
      apiKey,
      `${settings.name}:${settings.environment}`
    );

    const decryptedApiSecret = await decryptSecret(
      apiSecret,
      `${settings.name}:${settings.environment}`
    );

    const decryptedWebhookSecret = webhookSecret
      ? await decryptSecret(
          webhookSecret,
          `${settings.name}:${settings.environment}`
        )
      : undefined;


    return {
      ...rest,
      apiKey: decryptedApiKey,
      apiSecret: decryptedApiSecret,
      webhookSecret: decryptedWebhookSecret,
    };
  },
});


export const updatePaymentGatewaySetting = mutation({
  args: {
    id: v.id("paymentGatewaySettings"),
    name: v.string(),
    environment: v.union(v.literal("TEST"), v.literal("LIVE")),
    apiKey: v.string(),
    apiSecret: v.string(),
    webhookSecret: v.string(),
    supportedMethods: v.array(PaymentMethod),
    supportedNetworks: v.array(PaymentNetwork),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    const settings = await ctx.db.get(args.id);
    if (!settings) {
      throw new Error("Payment gateway settings not found");
    }
    
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const admins = parseAdminEmails();
    const email = identity.email?.toLowerCase();
    if (!email || !admins.includes(email)) throw new Error("Unauthorized");

    const hasMoMo = args.supportedMethods.includes("MOBILE_MONEY");
    if (hasMoMo && args.supportedNetworks.length === 0) {
      throw new Error("MOBILE_MONEY requires at least one supported network");
    }
    if (!hasMoMo && args.supportedNetworks.length > 0) {
      throw new Error(
        "supportedNetworks should be empty when MOBILE_MONEY is not enabled"
      );
    }

    // --- Prevent duplicate (name + environment)
    const dup = await ctx.db
      .query("paymentGatewaySettings")
      .filter((q) =>
        q.and(
          q.eq(q.field("name"), args.name),
          q.eq(q.field("environment"), args.environment)
        )
      )
      .first();
    if (dup)
      throw new Error("Gateway with this name and environment already exists");

    await sodium.ready;
    const keys = getKeys();
    const activeKey = keys[0];
    if (
      activeKey.length !== sodium.crypto_aead_xchacha20poly1305_ietf_KEYBYTES
    ) {
      throw new Error("Active key must be 32 bytes");
    }
    const keyVersion = 0;
    const aad = `${args.name}:${args.environment}`;

    // --- Encrypt secrets
    const encApiKey = await encryptSecret(
      args.apiKey,
      aad,
      activeKey,
      keyVersion
    );
    const encApiSecret = await encryptSecret(
      args.apiSecret,
      aad,
      activeKey,
      keyVersion
    );
    const encWebhookSec = args.webhookSecret
      ? await encryptSecret(args.webhookSecret, aad, activeKey, keyVersion)
      : undefined;

    // --- Insert
    const now = new Date().toISOString();
    await ctx.db.patch(args.id, {
      name: args.name,
      environment: args.environment,
      apiKey: encApiKey,
      apiSecret: encApiSecret,
      webhookSecret: encWebhookSec,
      supportedMethods: args.supportedMethods,
      supportedNetworks: args.supportedNetworks,
      isActive: args.isActive,
      updatedAt: now,
    });
  },
});


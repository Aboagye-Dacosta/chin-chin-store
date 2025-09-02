import { internalQuery, mutation } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import sodium from "libsodium-wrappers";
import { PaymentMethod, PaymentNetwork } from "./schema";

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

// export const createPaymentGatewaySetting = mutation({
//   args: {
//     name: v.string(),
//     environment: v.union(v.literal("TEST"), v.literal("LIVE")),
//     apiKey: v.string(),
//     apiSecret: v.string(),
//     webhookSecret: v.optional(v.string()),
//     supportedMethods: v.array(PaymentMethod),
//     supportedNetworks: v.array(PaymentNetwork),
//     isActive: v.boolean(),
//   },
//   handler: async (ctx, args) => {
//     const identity = await ctx.auth.getUserIdentity();
//     if (!identity) throw new Error("Not authenticated");
//     const admins = parseAdminEmails();
//     const email = identity.email?.toLowerCase();
//     if (!email || !admins.includes(email)) throw new Error("Unauthorized");

//     const hasMoMo = args.supportedMethods.includes("MOBILE_MONEY");
//     if (hasMoMo && args.supportedNetworks.length === 0) {
//       throw new Error("MOBILE_MONEY requires at least one supported network");
//     }
//     if (!hasMoMo && args.supportedNetworks.length > 0) {
//       throw new Error(
//         "supportedNetworks should be empty when MOBILE_MONEY is not enabled"
//       );
//     }

//     // --- Prevent duplicate (name + environment)
//     /**
//  * Functions for managing payment gateway settings and secret encryption/decryption.
//  */
// import { internalQuery, mutation } from "./_generated/server";
// import { v, ConvexError } from "convex/values";
// import sodium from "libsodium-wrappers";
// import { PaymentMethod, PaymentNetwork } from "./schema";

// /**
//  * Parses admin emails from environment variables.
//  *
//  * @returns {string[]} An array of admin email addresses.
//  */
// function parseAdminEmails(): string[] {
//   return (process.env.ADMIN_EMAILS || "")
//     .split(",")
//     .map((s) => s.trim().toLowerCase())
//     .filter(Boolean);
// }

// /**
//  * Requires an environment variable to be set.
//  *
//  * @param {string} name - The name of the environment variable.
//  * @returns {string} The value of the environment variable.
//  * @throws {ConvexError} If the environment variable is not set.
//  */
// function requireEnv(name: string): string {
//   const val = process.env[name];
//   if (!val) throw new ConvexError(`${name} not set`);
//   return val;
// }

// /**
//  * Retrieves encryption keys from environment variables.
//  *
//  * @returns {Uint8Array[]} An array of encryption keys.
//  * @throws {ConvexError} If no encryption keys are found.
//  */
// function getKeys(): Uint8Array[] {
//   const raw = requireEnv("ENC_KEYS_B64");
//   const arr = raw
//     .split(",")
//     .map((s) => s.trim())
//     .filter(Boolean);
//   if (arr.length === 0) throw new ConvexError("ENC_KEYS_B64 has no keys");
//   return arr.map((b64) =>
//     sodium.from_base64(b64, sodium.base64_variants.ORIGINAL)
//   );
// }

// /**
//  * Encrypts a secret using XChaCha20-Poly1305.
//  *
//  * @param {string} plaintext - The plaintext to encrypt.
//  * @param {string} aad - Additional authenticated data.
//  * @param {Uint8Array} key - The encryption key.
//  * @param {number} keyVersion - The version of the key.
//  * @returns {object} An object containing the ciphertext, nonce, and key version.
//  */
// async function encryptSecret(
//   plaintext: string,
//   aad: string,
//   key: Uint8Array,
//   keyVersion: number
// ) {
//   const nonce = sodium.randombytes_buf(
//     sodium.crypto_aead_xchacha20poly1305_ietf_NPUBBYTES
//   );
//   const ct = sodium.crypto_aead_xchacha20poly1305_ietf_encrypt(
//     sodium.from_string(plaintext),
//     sodium.from_string(aad),
//     null,
//     nonce,
//     key
//   );
//   return {
//     data: sodium.to_base64(ct, sodium.base64_variants.ORIGINAL),
//     nonce: sodium.to_base64(nonce, sodium.base64_variants.ORIGINAL),
//     v: keyVersion,
//   };
// }

/**
 * Creates a new payment gateway setting.
 *
 * @param {object} args - The arguments for the mutation.
 * @param {string} args.name - The name of the payment gateway.
 * @param {string} args.environment - The environment of the payment gateway ("TEST" or "LIVE").
 * @param {string} args.apiKey - The API key for the payment gateway.
 * @param {string} args.apiSecret - The API secret for the payment gateway.
 * @param {string} [args.webhookSecret] - The webhook secret for the payment gateway.
 * @param {Array<string>} args.supportedMethods - An array of supported payment methods.
 * @param {Array<string>} args.supportedNetworks - An array of supported payment networks.
 * @param {boolean} args.isActive - A flag indicating whether the payment gateway is active.
 * @returns {object} An object indicating success and the ID of the new setting.
 * @throws {ConvexError} If the user is not authenticated or unauthorized,
 * MOBILE_MONEY requirements are not met, a duplicate gateway exists, or the active key is invalid.
 */
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
    if (!identity) throw new ConvexError("Not authenticated");
    const admins = parseAdminEmails();
    const email = identity.email?.toLowerCase();
    if (!email || !admins.includes(email)) throw new ConvexError("Unauthorized");

    const hasMoMo = args.supportedMethods.includes("MOBILE_MONEY");
    if (hasMoMo && args.supportedNetworks.length === 0) {
      throw new ConvexError("MOBILE_MONEY requires at least one supported network");
    }
    if (!hasMoMo && args.supportedNetworks.length > 0) {
      throw new ConvexError(
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
      throw new ConvexError("Gateway with this name and environment already exists");

    await sodium.ready;
    const keys = getKeys();
    const activeKey = keys[0];
    if (
      activeKey.length !== sodium.crypto_aead_xchacha20poly1305_ietf_KEYBYTES
    ) {
      throw new ConvexError("Active key must be 32 bytes");
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

/**
 * Decrypts a secret using XChaCha20-Poly1305.
 *
 * @param {object} blob - The encrypted blob containing data, nonce, and key version.
 * @param {string} aad - Additional authenticated data.
 * @returns {Promise<string>} The decrypted plaintext.
 * @throws {ConvexError} If no key is found for the given version.
 */
export const decryptSecret = async function (
  blob: { data: string; nonce: string; v: number },
  aad: string
): Promise<string> {
  await sodium.ready;
  const keys = getKeys();
  const key = keys[blob.v];
  if (!key) throw new ConvexError(`No key for version ${blob.v}`);
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

/**
 * Retrieves payment gateway settings.
 *
 * @returns {object|null} The decrypted payment gateway settings, or null if not found.
 * @throws {ConvexError} If payment gateway settings are not found.
 */
export const getPaymentGatewaySettings = internalQuery({
  handler: async (ctx) => {
    const settings = await ctx.db
      .query("paymentGatewaySettings")
      .first();

    if (!settings) {
      throw new ConvexError("Payment gateway settings not found");
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


// /**
//  * Updates an existing payment gateway setting.
//  *
//  * @param {object} args - The arguments for the mutation.
//  * @param {string} args.id - The ID of the payment gateway setting to update.
//  * @param {string} args.name - The new name of the payment gateway.
//  * @param {string} args.environment - The new environment of the payment gateway ("TEST" or "LIVE").
//  * @param {string} args.apiKey - The new API key for the payment gateway.
//  * @param {string} args.apiSecret - The new API secret for the payment gateway.
//  * @param {string} args.webhookSecret - The new webhook secret for the payment gateway.
//  * @param {Array<string>} args.supportedMethods - An array of supported payment methods.
//  * @param {Array<string>} args.supportedNetworks - An array of supported payment networks.
//  * @param {boolean} args.isActive - A flag indicating whether the payment gateway is active.
//  * @throws {ConvexError} If payment gateway settings are not found, user is not authenticated or unauthorized,
//  * MOBILE_MONEY requirements are not met, or the active key is invalid.
//  */
// export const updatePaymentGatewaySetting = mutation({
//   args: {
//     id: v.id("paymentGatewaySettings"),
//     name: v.string(),
//     environment: v.union(v.literal("TEST"), v.literal("LIVE")),
//     apiKey: v.string(),
//     apiSecret: v.string(),
//     webhookSecret: v.string(),
//     supportedMethods: v.array(PaymentMethod),
//     supportedNetworks: v.array(PaymentNetwork),
//     isActive: v.boolean(),
//   },
//   handler: async (ctx, args) => {
//     const settings = await ctx.db.get(args.id);
//     if (!settings) {
//       throw new ConvexError("Payment gateway settings not found");
//     }
    
//     const identity = await ctx.auth.getUserIdentity();
//     if (!identity) throw new ConvexError("Not authenticated");
//     const admins = parseAdminEmails();
//     const email = identity.email?.toLowerCase();
//     if (!email || !admins.includes(email)) throw new ConvexError("Unauthorized");

//     const hasMoMo = args.supportedMethods.includes("MOBILE_MONEY");
//     if (hasMoMo && args.supportedNetworks.length === 0) {
//       throw new ConvexError("MOBILE_MONEY requires at least one supported network");
//     }
//     if (!hasMoMo && args.supportedNetworks.length > 0) {
//       throw new ConvexError(
//         "supportedNetworks should be empty when MOBILE_MONEY is not enabled"
//       );
//     }

//     await sodium.ready;
//     const keys = getKeys();
//     const activeKey = keys[0];
//     if (
//       activeKey.length !== sodium.crypto_aead_xchacha20poly1305_ietf_KEYBYTES
//     ) {
//       throw new ConvexError("Active key must be 32 bytes");
//     }
//     const keyVersion = 0;
//     const aad = `${args.name}:${args.environment}`;

//     // --- Encrypt secrets
//     const encApiKey = await encryptSecret(
//       args.apiKey,
//       aad,
//       activeKey,
//       keyVersion
//     );
//     const encApiSecret = await encryptSecret(
//       args.apiSecret,
//       aad,
//       activeKey,
//       keyVersion
//     );
//     const encWebhookSec = args.webhookSecret
//       ? await encryptSecret(args.webhookSecret, aad, activeKey, keyVersion)
//       : undefined;

//     // --- Insert
//     const now = new Date().toISOString();
//     await ctx.db.patch(args.id, {
//       name: args.name,
//       environment: args.environment,
//       apiKey: encApiKey,
//       apiSecret: encApiSecret,
//       webhookSecret: encWebhookSec,
//       supportedMethods: args.supportedMethods,
//       supportedNetworks: args.supportedNetworks,
//       isActive: args.isActive,
//       updatedAt: now,
//     });
//   },
// });
//     if (dup)
//       throw new Error("Gateway with this name and environment already exists");

//     await sodium.ready;
//     const keys = getKeys();
//     const activeKey = keys[0];
//     if (
//       activeKey.length !== sodium.crypto_aead_xchacha20poly1305_ietf_KEYBYTES
//     ) {
//       throw new Error("Active key must be 32 bytes");
//     }
//     const keyVersion = 0;
//     const aad = `${args.name}:${args.environment}`;

//     // --- Encrypt secrets
//     const encApiKey = await encryptSecret(
//       args.apiKey,
//       aad,
//       activeKey,
//       keyVersion
//     );
//     const encApiSecret = await encryptSecret(
//       args.apiSecret,
//       aad,
//       activeKey,
//       keyVersion
//     );
//     const encWebhookSec = args.webhookSecret
//       ? await encryptSecret(args.webhookSecret, aad, activeKey, keyVersion)
//       : undefined;

//     // --- Insert
//     const now = new Date().toISOString();
//     const id = await ctx.db.insert("paymentGatewaySettings", {
//       name: args.name,
//       environment: args.environment,
//       apiKey: encApiKey,
//       apiSecret: encApiSecret,
//       webhookSecret: encWebhookSec,
//       supportedMethods: args.supportedMethods,
//       supportedNetworks: args.supportedNetworks,
//       isActive: args.isActive,
//       createdAt: now,
//       updatedAt: now,
//     });

//     return { success: true, id };
//   },
// });

// export const decryptSecret = async function (
//   blob: { data: string; nonce: string; v: number },
//   aad: string
// ): Promise<string> {
//   await sodium.ready;
//   const keys = getKeys();
//   const key = keys[blob.v];
//   if (!key) throw new Error(`No key for version ${blob.v}`);
//   const ct = sodium.from_base64(blob.data, sodium.base64_variants.ORIGINAL);
//   const nonce = sodium.from_base64(blob.nonce, sodium.base64_variants.ORIGINAL);
//   const pt = sodium.crypto_aead_xchacha20poly1305_ietf_decrypt(
//     null,
//     ct,
//     sodium.from_string(aad),
//     nonce,
//     key
//   );
//   return sodium.to_string(pt);
// };

// export const getPaymentGatewaySettings = internalQuery({
//   handler: async (ctx) => {
//     const settings = await ctx.db
//       .query("paymentGatewaySettings")
//       .first();

//     if (!settings) {
//       throw new Error("Payment gateway settings not found");
//     }

//     const { apiKey, apiSecret, webhookSecret, ...rest } = settings;

//     const decryptedApiKey = await decryptSecret(
//       apiKey,
//       `${settings.name}:${settings.environment}`
//     );

//     const decryptedApiSecret = await decryptSecret(
//       apiSecret,
//       `${settings.name}:${settings.environment}`
//     );

//     const decryptedWebhookSecret = webhookSecret
//       ? await decryptSecret(
//           webhookSecret,
//           `${settings.name}:${settings.environment}`
//         )
//       : undefined;


//     return {
//       ...rest,
//       apiKey: decryptedApiKey,
//       apiSecret: decryptedApiSecret,
//       webhookSecret: decryptedWebhookSecret,
//     };
//   },
// });


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


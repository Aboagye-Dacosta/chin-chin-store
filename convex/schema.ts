import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// convex/schema.ts (snippet)
const SecretBlob = v.object({
  data: v.string(), // base64 ciphertext (includes Poly1305 tag)
  nonce: v.string(), // base64 24-byte nonce
  v: v.number(), // key version (index into ENC_KEYS_B64)
});

export const OrderStatus = v.union(
  v.literal("PENDING"),
  v.literal("PROCESSING"),
  v.literal("DELIVERED"),
  v.literal("CANCELLED")
);

export const PaymentStatus = v.union(
  v.literal("PENDING"),
  v.literal("PAID"),
  v.literal("FAILED"),
  v.literal("CANCELLED"),
  v.literal("ORDER_CANCELLED"),
  v.literal("REFUNDED"),
  v.literal("AWAITING_CONFIRMATION")
);

export const PaymentMethod = v.union(
  v.literal("MOBILE_MONEY"),
  v.literal("CARD")
);

export const PaymentNetwork = v.union(
  v.literal("MTN"),
  v.literal("AIRTELTIGO"),
  v.literal("VODAFONE")
);

export const Role = v.union(
  v.literal("SUPER_ADMIN"),
  v.literal("VENDOR"),
  v.literal("USER")
);

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    role: Role,
    clerkId: v.string(),
    profileId: v.optional(v.id("profiles")),
    addressId: v.optional(v.id("addresses")),
    createdAt: v.string(),
    updatedAt: v.string(),
  })
    .index("byEmail", ["email"])
    .index("byClerkId", ["clerkId"])
    .index("byRole", ["role"]),

  profiles: defineTable({
    phoneNumber: v.string(),
    address: v.string(),
    bio: v.string(),
    imageUrl: v.string(),
    userId: v.id("users"),
  }).index("byUser", ["userId"]),

  stores: defineTable({
    name: v.string(),
    locationId: v.id("locations"),
    deliveryCharge: v.float64(),
    createdAt: v.string(),
    updatedAt: v.string(),
  }).index("byName", ["name"]),

  locations: defineTable({
    name: v.string(),
    createdAt: v.string(),
    updatedAt: v.string(),
  }).index("byName", ["name"]),

  categories: defineTable({
    name: v.string(),
    color: v.optional(v.string()),
    createdAt: v.string(),
    updatedAt: v.string(),
  }).index("byName", ["name"]),

  products: defineTable({
    title: v.string(),
    description: v.string(),
    price: v.float64(),
    stock: v.number(),
    image: v.optional(v.string()),
    model: v.optional(v.string()),
    status: v.union(v.literal("Active"), v.literal("Inactive")),
    packaging: v.union(v.literal("Bag"), v.literal("Can")),
    categoryId: v.id("categories"),
    storeId: v.id("stores"),
    createdAt: v.string(),
    updatedAt: v.string(),
  })
    .index("byCategory", ["categoryId"])
    .index("byStore", ["storeId"]),

  payments: defineTable({
    orderId: v.id("orders"),
    amount: v.float64(),
    currency: v.string(),
    method: v.union(
      v.literal("MOBILE_MONEY"),
      v.literal("PAYMENT_ON_DELIVERY"),
      v.literal("CARD")
    ),
    status: PaymentStatus,
    phoneNumber: v.optional(v.string()),
    mobileNetwork: v.optional(PaymentNetwork),
    transactionId: v.optional(v.string()),
    transactionReference: v.optional(v.string()),
    metadata: v.optional(v.any()),
    paymentGatewaySettingsId: v.optional(v.id("paymentGatewaySettings")),
    createdAt: v.string(),
    updatedAt: v.string(),
  }).index("byOrder", ["orderId"]),

  paymentGatewaySettings: defineTable({
    name: v.string(),
    environment: v.union(v.literal("TEST"), v.literal("LIVE")),
    apiKey: SecretBlob,
    apiSecret: SecretBlob,
    webhookSecret: v.optional(SecretBlob),
    supportedMethods: v.array(PaymentMethod),
    supportedNetworks: v.array(PaymentNetwork),
    isActive: v.boolean(),
    createdAt: v.string(),
    updatedAt: v.string(),
  }),

  orders: defineTable({
    vendorId: v.id("vendors"),
    userId: v.id("users"),
    total: v.float64(),
    deliveryAddressLabel: v.string(),
    deliveryNote: v.optional(v.string()),
    deliveryCharge: v.optional(v.float64()),
    status: OrderStatus,
    trackingNumber: v.string(),
    createdAt: v.string(),
    updatedAt: v.string(),
    storeId: v.id("stores"),
  })
    .index("byVendor", ["vendorId"])
    .index("byUser", ["userId"])
    .index("byStore", ["storeId"])
    .index("byTrackingNumber", ["trackingNumber"])
    .index("byUserAndStore", ["userId", "storeId"])
    .index("byVendorAndStore", ["vendorId", "storeId"]),

  orderItems: defineTable({
    orderId: v.id("orders"),
    productId: v.id("products"),
    quantity: v.number(),
    createdAt: v.string(),
    updatedAt: v.string(),
  }).index("byOrder", ["orderId"]),

  carts: defineTable({
    userId: v.id("users"),
    storeId: v.id("stores"),
    status: v.union(
      v.literal("ACTIVE"),
      v.literal("CHECKED_OUT"),
      v.literal("ABANDONED")
    ),
    createdAt: v.string(),
    updatedAt: v.string(),
  })
    .index("byUser", ["userId"])
    .index("byStore", ["storeId"])
    .index("byUserAndStore", ["userId", "storeId"]),

  cartItems: defineTable({
    cartId: v.id("carts"),
    productId: v.id("products"),
    quantity: v.number(),
    total: v.float64(),
    createdAt: v.string(),
    updatedAt: v.string(),
  })
    .index("byCart", ["cartId"])
    .index("byProduct", ["productId"])
    .index("byCartAndProduct", ["cartId", "productId"]),

  addresses: defineTable({
    userId: v.id("users"),
    deliveryAddress: v.string(),
    deliveryAddressNote: v.optional(v.string()),
    isDefault: v.boolean(),
    createdAt: v.string(),
    updatedAt: v.string(),
  }).index("byUser", ["userId"]),

  vendors: defineTable({
    userId: v.id("users"),
    storeId: v.id("stores"),
    role: v.literal("VENDOR"),
    mobileMoney: v.object({
      phoneNumber: v.string(),
      provider: PaymentNetwork,
    }),
    clerkId: v.string(),
    paystackRecipientCode: v.optional(v.string()),
    createdAt: v.string(),
    updatedAt: v.string(),
  })
    .index("byUser", ["userId"])
    .index("byStore", ["storeId"])
    .index("byUserAndStore", ["userId", "storeId"]),
});

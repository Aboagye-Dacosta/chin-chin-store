/**
 * Defines the database schema for the application.
 */
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

/**
 * Represents an encrypted secret blob.
 */
const SecretBlob = v.object({
  data: v.string(), // base64 ciphertext (includes Poly1305 tag)
  nonce: v.string(), // base64 24-byte nonce
  v: v.number(), // key version (index into ENC_KEYS_B64)
});

/**
 * Defines the possible statuses for an order.
 */
export const OrderStatus = v.union(
  v.literal("PENDING"),
  v.literal("PROCESSING"),
  v.literal("DELIVERED"),
  v.literal("CANCELLED")
);

/**
 * Defines the possible statuses for a payment.
 */
export const PaymentStatus = v.union(
  v.literal("PENDING"),
  v.literal("PAID"),
  v.literal("FAILED"),
  v.literal("CANCELLED"),
  v.literal("ORDER_CANCELLED"),
  v.literal("REFUND_REQUESTED"),
  v.literal("REFUNDED"),
  v.literal("AWAITING_CONFIRMATION")
);

/**
 * Defines the possible payment methods.
 */
export const PaymentMethod = v.union(
  v.literal("MOBILE_MONEY"),
  v.literal("CARD")
);

/**
 * Defines the possible mobile money payment networks.
 */
export const PaymentNetwork = v.union(
  v.literal("MTN"),
  v.literal("AIRTELTIGO"),
  v.literal("VODAFONE")
);

/**
 * Defines the possible user roles.
 */
export const Role = v.union(
  v.literal("SUPER_ADMIN"),
  v.literal("VENDOR"),
  v.literal("USER")
);

/**
 * Defines the possible vendor statuses.
 */
export const VendorStatus = v.union(v.literal("ACTIVE"), v.literal("INACTIVE"));

export default defineSchema({
  /**
   * Users table.
   */
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

  /**
   * Profiles table.
   */
  profiles: defineTable({
    phoneNumber: v.string(),
    address: v.string(),
    bio: v.string(),
    imageUrl: v.string(),
    userId: v.id("users"),
  }).index("byUser", ["userId"]),

  /**
   * Stores table.
   */
  stores: defineTable({
    name: v.string(),
    locationId: v.id("locations"),
    deliveryCharge: v.float64(),
    createdAt: v.string(),
    updatedAt: v.string(),
  })
    .index("byName", ["name"])
    .index("byLocation", ["locationId"]),

  /**
   * Locations table.
   */
  locations: defineTable({
    name: v.string(),
    createdAt: v.string(),
    updatedAt: v.string(),
  }).index("byName", ["name"]),

  /**
   * Categories table.
   */
  categories: defineTable({
    name: v.string(),
    color: v.optional(v.string()),
    createdAt: v.string(),
    updatedAt: v.string(),
  }).index("byName", ["name"]),

  /**
   * Products table.
   */
  products: defineTable({
    title: v.string(),
    description: v.string(),
    price: v.float64(),
    image: v.optional(v.id("assets")),
    model: v.optional(v.id("assets")),
    status: v.union(v.literal("Active"), v.literal("Inactive")),
    packaging: v.union(v.literal("Bag"), v.literal("Can")),
    categoryId: v.id("categories"),
    createdAt: v.string(),
    updatedAt: v.string(),
  })
    .index("byCategory", ["categoryId"])
    .index("byImage", ["image"])
    .index("model", ["model"]),

  /**
   * Products by Store table.
   */
  productsByStore: defineTable({
    storeId: v.id("stores"),
    productId: v.id("products"),
    quantity: v.number(),
    createdAt: v.string(),
    updatedAt: v.string(),
  })
    .index("byStore", ["storeId"])
    .index("byProduct", ["productId"])
    .index("byStoreAndProduct", ["storeId", "productId"]),

  /**
   * Payments table.
   */
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

  /**
   * Payment Gateway Settings table.
   */
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

  /**
   * Orders table.
   */
  orders: defineTable({
    vendorId: v.id("vendors"),
    userId: v.optional(v.id("users")),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
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

  /**
   * Order Items table.
   */
  orderItems: defineTable({
    orderId: v.id("orders"),
    productId: v.id("products"),
    quantity: v.number(),
    createdAt: v.string(),
    updatedAt: v.string(),
  })
    .index("byOrder", ["orderId"])
    .index("byProduct", ["productId"]),

  /**
   * Carts table.
   */
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

  /**
   * Cart Items table.
   */
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

  /**
   * Addresses table.
   */
  addresses: defineTable({
    userId: v.id("users"),
    deliveryAddress: v.string(),
    deliveryAddressNote: v.optional(v.string()),
    isDefault: v.boolean(),
    createdAt: v.string(),
    updatedAt: v.string(),
  }).index("byUser", ["userId"]),

  /**
   * Vendors table.
   */
  vendors: defineTable({
    userId: v.id("users"),
    storeId: v.id("stores"),
    role: v.literal("VENDOR"),
    mobileMoney: v.object({
      phoneNumber: v.string(),
      provider: PaymentNetwork,
    }),
    status: v.optional(VendorStatus),
    clerkId: v.string(),
    paystackRecipientCode: v.optional(v.string()),
    createdAt: v.string(),
    updatedAt: v.string(),
  })
    .index("byUser", ["userId"])
    .index("byStore", ["storeId"])
    .index("byUserAndStore", ["userId", "storeId"]),

  /**
   * Assets table.
   */
  assets: defineTable({
    name: v.string(),
    storageId: v.id("_storage"),
    isModel: v.boolean(),
    createdAt: v.string(),
    updatedAt: v.string(),
  }).index("byName", ["name"]),

  /**
   * Support table.
   */
  support: defineTable({
    email: v.string(),
    phone: v.string(),
    address: v.string(),
    operationHours: v.string(),
    createdAt: v.string(),
    updatedAt: v.string(),
  }).index("byEmail", ["email"]),

  /**
   * Sales Analytics table.
   */
  salesAnalytics: defineTable({
    date: v.string(),
    totalRevenue: v.float64(),
    totalOrders: v.number(),
    storeId: v.id("stores"),
  })
    .index("byDate", ["date"])
    .index("byStore", ["storeId"]),

  /**
   * User Analytics table.
   */
  userAnalytics: defineTable({
    date: v.string(),
    newCustomers: v.number(),
    activeUsers: v.number(),
  }).index("byDate", ["date"]),

  /**
   * Product Analytics table.
   */
  productAnalytics: defineTable({
    productId: v.id("products"),
    totalSold: v.number(),
    totalRevenue: v.float64(),
  }).index("byProduct", ["productId"]),

  /**
   * Store Analytics table.
   */
  storeAnalytics: defineTable({
    storeId: v.id("stores"),
    totalRevenue: v.float64(),
    totalOrders: v.number(),
  }).index("byStore", ["storeId"]),
});

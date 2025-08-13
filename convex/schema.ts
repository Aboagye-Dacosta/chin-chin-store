import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    role: v.union(v.literal("SUPER_ADMIN"), v.literal("VENDOR"), v.literal("USER")),
    clerkId: v.string(),
    profileId: v.optional(v.id("profiles")),
    storeId: v.optional(v.id("stores")),
    addressId: v.optional(v.id("addresses")),
    createdAt: v.string(),
    updatedAt: v.string(),
  }).index("byEmail", ["email"])
    .index("byClerkId", ["clerkId"]),

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
    deliveryChargeId: v.optional(v.id("deliveryCharges")),
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
    createdAt: v.string(),
    updatedAt: v.string(),
  }).index("byName", ["name"]),

  products: defineTable({
    title: v.string(),
    description: v.string(),
    price: v.float64(),
    stock: v.number(),
    image: v.optional(v.string()),
    status: v.union(v.literal("Active"), v.literal("Inactive")),
    packaging: v.union(v.literal("Bag"), v.literal("Can")),
    categoryId: v.id("categories"),
    storeId: v.id("stores"),
    createdAt: v.string(),
    updatedAt: v.string(),
  }).index("byCategory", ["categoryId"])
    .index("byStore", ["storeId"]),

  payments: defineTable({
    orderId: v.id("orders"),
    amount: v.float64(),
    currency: v.string(),
    method: v.union(v.literal("MOBILE_MONEY"), v.literal("PAYMENT_ON_DELIVERY"), v.literal("CARD")),
    status: v.union(
      v.literal("PENDING"),
      v.literal("PAID"),
      v.literal("FAILED"),
      v.literal("REFUNDED"),
      v.literal("AWAITING_CONFIRMATION")
    ),
    phoneNumber: v.optional(v.string()),
    mobileNetwork: v.optional(
      v.union(v.literal("MTN"), v.literal("AIRTELTIGO"), v.literal("TELECEL"))
    ),
    transactionId: v.optional(v.string()),
    transactionReference: v.optional(v.string()),
    metadata: v.optional(v.any()),
    paymentGatewaySettingsId: v.id("paymentGatewaySettings"),
    createdAt: v.string(),
    updatedAt: v.string(),
  }).index("byOrder", ["orderId"]),

  paymentGatewaySettings: defineTable({
    name: v.string(),
    environment: v.union(v.literal("TEST"), v.literal("LIVE")),
    apiKey: v.string(),
    apiSecret: v.string(),
    webhookSecret: v.optional(v.string()),
    supportedMethods: v.array(
      v.union(v.literal("MOBILE_MONEY"), v.literal("PAYMENT_ON_DELIVERY"), v.literal("CARD"))
    ),
    supportedNetworks: v.array(
      v.union(v.literal("MTN"), v.literal("AIRTELTIGO"), v.literal("TELECEL"))
    ),
    createdAt: v.string(),
    updatedAt: v.string(),
  }),

  orders: defineTable({
    userId: v.id("users"),
    vendorId: v.id("users"),
    total: v.float64(),
    deliveryAddressLabel: v.string(),
    deliveryCity: v.string(),
    deliveryNote: v.string(),
    status: v.union(
      v.literal("Pending"),
      v.literal("Processing"),
      v.literal("Delivered"),
      v.literal("Cancelled")
    ),
    trackingNumber: v.optional(v.string()),
    createdAt: v.string(),
    updatedAt: v.string(),
  }).index("byUser", ["userId"])
    .index("byVendor", ["vendorId"]),

  orderItems: defineTable({
    orderId: v.id("orders"),
    productId: v.id("products"),
    quantity: v.number(),
    createdAt: v.string(),
    updatedAt: v.string(),
  }).index("byOrder", ["orderId"]),

  deliveryCharges: defineTable({
    amount: v.float64(),
    storeId: v.id("stores"),
    createdAt: v.string(),
    updatedAt: v.string(),
  }).index("byStore", ["storeId"]),

  carts: defineTable({
    userId: v.id("users"),
    storeId: v.id("stores"),
    status: v.union(v.literal("ACTIVE"), v.literal("CHECKED_OUT"), v.literal("ABANDONED")),
    createdAt: v.string(),
    updatedAt: v.string(),
  }).index("byUser", ["userId"])
    .index("byStore", ["storeId"]) 
    .index("byUserAndStore", ["userId", "storeId"]),

  cartItems: defineTable({
    cartId: v.id("carts"),
    productId: v.id("products"),
    quantity: v.number(),
    total: v.float64(),
    createdAt: v.string(),
    updatedAt: v.string(),
  }).index("byCart", ["cartId"])
    .index("byProduct", ["productId"]) 
    .index("byCartAndProduct", ["cartId", "productId"]),

  addresses: defineTable({
    userId: v.id("users"),
    label: v.string(),
    city: v.string(),
    isDefault: v.boolean(),
    createdAt: v.string(),
    updatedAt: v.string(),
  }).index("byUser", ["userId"]),
});
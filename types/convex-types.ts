import { Doc } from "@/convex/_generated/dataModel";

export type CartItem = Doc<"cartItems"> & {
  existingQuantity?: number;
};

export type Product = Doc<"products">;

export type Cart = Doc<"carts">;

export type DeliveryCharge = Doc<"deliveryCharges">;

export type Vendor = Doc<"vendors">;

export type Order = Doc<"orders">;

export type OrderItem = Doc<"orderItems">;

export type Payment = Doc<"payments">;

export type Store = Doc<"stores">;

export type PaymentSettings = Doc<"paymentGatewaySettings">;

export type Category = Doc<"categories">;

export type Location = Doc<"locations">;

export type User = Doc<"users">;

export type PaymentMethod = "MOBILE_MONEY" | "PAYMENT_ON_DELIVERY";

export type MobileMoneyProvider = "MTN" | "AIRTELTIGO" | "TELECEL";





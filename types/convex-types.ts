import { Doc } from "@/convex/_generated/dataModel";

export type CartItem = Doc<"cartItems"> & {
  existingQuantity?: number;
};

export type Product = Doc<"products">;

export type Cart = Doc<"carts">;

export type DeliveryCharge = Doc<"deliveryCharges">;

export type Vendor = Doc<"users">;

export type Order = Doc<"orders">;

export type OrderItem = Doc<"orderItems">;

export type Payment = Doc<"payments">;

export type Store = Doc<"stores">;

export type PaymentSettings = Doc<"paymentGatewaySettings">;

export type Category = Doc<"categories">;

export type Location = Doc<"locations">;




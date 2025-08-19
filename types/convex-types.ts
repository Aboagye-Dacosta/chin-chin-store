import { Doc } from "@/convex/_generated/dataModel";

export type CartItem = Doc<"cartItems"> & {
  existingQuantity?: number;
};

export type Product = Doc<"products">;

export type Cart = Doc<"carts">;

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

export type MobileMoneyProvider = "MTN" | "AIRTELTIGO" | "VODAFONE";

export type OrderItemWithProduct = OrderItem & {
  product: Product | null;
};

export type OrderWithItems = Order & {
  items: OrderItemWithProduct[];
  payment: Payment | null;
};

export type OrderStatus = Order["status"];

export type StoreWithLocation = Store & {
  location: Location | null;
  vendors: {
    name: string | undefined;
  }[];
  productCount: number;
};

export type ProductWithCategory = Product & {
  category: Category | null;
};

export type ProductWithStoreAndCategory = Product & {
  store: Store | null;
  category: Category | null;
};



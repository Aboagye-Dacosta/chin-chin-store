/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as cart from "../cart.js";
import type * as cartItems from "../cartItems.js";
import type * as categories from "../categories.js";
import type * as createTransferRecipient from "../createTransferRecipient.js";
import type * as deliveryCharge from "../deliveryCharge.js";
import type * as handleClerk from "../handleClerk.js";
import type * as http from "../http.js";
import type * as locations from "../locations.js";
import type * as orders from "../orders.js";
import type * as paymentGateway from "../paymentGateway.js";
import type * as payments from "../payments.js";
import type * as products from "../products.js";
import type * as stores from "../stores.js";
import type * as syncCartToDB from "../syncCartToDB.js";
import type * as users from "../users.js";
import type * as vendors from "../vendors.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  cart: typeof cart;
  cartItems: typeof cartItems;
  categories: typeof categories;
  createTransferRecipient: typeof createTransferRecipient;
  deliveryCharge: typeof deliveryCharge;
  handleClerk: typeof handleClerk;
  http: typeof http;
  locations: typeof locations;
  orders: typeof orders;
  paymentGateway: typeof paymentGateway;
  payments: typeof payments;
  products: typeof products;
  stores: typeof stores;
  syncCartToDB: typeof syncCartToDB;
  users: typeof users;
  vendors: typeof vendors;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

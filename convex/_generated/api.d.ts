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
import type * as assets from "../assets.js";
import type * as cart from "../cart.js";
import type * as cartItems from "../cartItems.js";
import type * as categories from "../categories.js";
import type * as createTransferRecipient from "../createTransferRecipient.js";
import type * as handleClerk from "../handleClerk.js";
import type * as http from "../http.js";
import type * as locations from "../locations.js";
import type * as orders from "../orders.js";
import type * as paymentGateway from "../paymentGateway.js";
import type * as payments_addPayments from "../payments/addPayments.js";
import type * as payments_allPayments from "../payments/allPayments.js";
import type * as payments_paymentById from "../payments/paymentById.js";
import type * as payments_paymentSettings from "../payments/paymentSettings.js";
import type * as payments_paystack from "../payments/paystack.js";
import type * as payments_updatePayment from "../payments/updatePayment.js";
import type * as products from "../products.js";
import type * as productsByStore from "../productsByStore.js";
import type * as stores from "../stores.js";
import type * as support from "../support.js";
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
  assets: typeof assets;
  cart: typeof cart;
  cartItems: typeof cartItems;
  categories: typeof categories;
  createTransferRecipient: typeof createTransferRecipient;
  handleClerk: typeof handleClerk;
  http: typeof http;
  locations: typeof locations;
  orders: typeof orders;
  paymentGateway: typeof paymentGateway;
  "payments/addPayments": typeof payments_addPayments;
  "payments/allPayments": typeof payments_allPayments;
  "payments/paymentById": typeof payments_paymentById;
  "payments/paymentSettings": typeof payments_paymentSettings;
  "payments/paystack": typeof payments_paystack;
  "payments/updatePayment": typeof payments_updatePayment;
  products: typeof products;
  productsByStore: typeof productsByStore;
  stores: typeof stores;
  support: typeof support;
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

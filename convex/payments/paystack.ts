/**
 * Paystack API integration for initializing and verifying transactions.
 */
import { v , ConvexError} from "convex/values";
import { internal } from "../_generated/api";
import { action } from "../_generated/server";

type PaystackAuthorizationResponse = {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
    paymentId?: string;
  };
};

type PaystackVerificationResponse = {
  status: boolean;
  message: string;
  data: {
    id: number;
    domain: string;
    status: string;
    reference: string;
    receipt_number: string | null;
    amount: number;
    message: string | null;
  };
};

/**
 * Initializes a Paystack transaction with a subaccount.
 *
 * @param {object} args - The arguments for the action.
 * @param {string} args.email - The email of the customer.
 * @param {number} args.amount - The amount of the transaction.
 * @param {string} args.vendorId - The ID of the vendor.
 * @param {string} args.orderId - The ID of the order.
 * @param {string} [args.reference] - The transaction reference.
 * @param {string} [args.callback_url] - The callback URL after payment.
 * @returns {Promise<PaystackAuthorizationResponse["data"]>} The Paystack authorization response data.
 * @throws {ConvexError} If Paystack secret key is not configured, vendor or subaccount code not found,
 * or failed to initialize transaction.
 */
export const initializePaystackTransaction = action({
  args: {
    email: v.string(),
    amount: v.number(),
    vendorId: v.id("vendors"),
    orderId: v.id("orders"),
    reference: v.optional(v.string()),
    callback_url: v.optional(v.string()),
  },
  handler: async (
    ctx,
    args
  ): Promise<PaystackAuthorizationResponse["data"]> => {
    const secretKey = await ctx.runQuery(
      internal.paymentGateway.getPaymentGatewaySettings
    );
    if (!secretKey) {
      throw new ConvexError("Paystack secret key is not configured.");
    } 

    const vendor = await ctx.runQuery(internal.vendors.readVendorById, {
      vendorId: args.vendorId,
    });

    if (!vendor?.paystackRecipientCode) {
      throw new ConvexError("Vendor or Paystack subaccount code not found.");
    }

    const paymentId = await ctx.runMutation(
      internal.payments.addPayments.insert,
      {
        orderId: args.orderId,
        amount: args.amount,
        currency: "GHS",
        method: "MOBILE_MONEY",
        status: "PENDING",
        phoneNumber: vendor?.mobileMoney?.phoneNumber,
        mobileNetwork: vendor?.mobileMoney?.provider,
        transactionId: args.reference,
        transactionReference: args.reference,
        paymentGatewaySettingsId: secretKey._id,
      }
    );

    const body = {
      email: args.email,
      amount: args.amount * 100,
      currency: "GHS",
      reference: args.reference,
      callback_url: args.callback_url,
      subaccount: vendor.paystackRecipientCode, // Use subaccount_code
      channels: secretKey.supportedMethods.map((method) =>
        method.toLowerCase()
      ),
      transaction_charge: 0, // Platform covers fees, adjust as needed
      metadata: { vendorId: args.vendorId, vendorName: vendor.user?.name },
    };

    const response = await fetch(
      "https://api.paystack.co/transaction/initialize",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${secretKey.apiSecret}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    const result: PaystackAuthorizationResponse = await response.json();
    if (!response.ok || !result.status) {
      throw new ConvexError(result.message || "Failed to initialize transaction");
    }

    return {
      ...result.data,
      paymentId,
    };
  },
});

/**
 * Verifies a Paystack transaction.
 *
 * @param {object} args - The arguments for the action.
 * @param {string} args.orderId - The ID of the order.
 * @param {string} args.reference - The transaction reference.
 * @param {string} args.paymentId - The ID of the payment.
 * @param {string} args.vendorId - The ID of the vendor.
 * @param {string} [args.cartId] - The ID of the cart (optional).
 * @param {string} args.storeId - The ID of the store.
 * @returns {Promise<PaystackVerificationResponse["data"]>} The Paystack verification response data.
 * @throws {ConvexError} If Paystack secret key is not configured, vendor or subaccount code not found,
 * or failed to verify transaction.
 */
export const verifyPaystackTransaction = action({
  args: {
    orderId: v.id("orders"),
    reference: v.string(),
    paymentId: v.id("payments"),
    vendorId: v.id("vendors"),
    cartId: v.optional(v.id("carts")),
    storeId: v.id("stores"),
  },
  handler: async (ctx, args): Promise<PaystackVerificationResponse["data"]> => {
    const secretKey = await ctx.runQuery(
      internal.paymentGateway.getPaymentGatewaySettings
    );
    if (!secretKey) {
      throw new ConvexError("Paystack secret key is not configured.");
    }

    const vendor = await ctx.runQuery(internal.vendors.readVendorById, {
      vendorId: args.vendorId,
    });

    if (!vendor?.paystackRecipientCode) {
      throw new ConvexError("Vendor or subaccount code not found.");
    }

    const response = await fetch(
      `https://api.paystack.co/transaction/verify/${args.reference}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${secretKey.apiSecret}`,
          "Content-Type": "application/json",
        },
      }
    );

    const result: PaystackVerificationResponse = await response.json();

    if (!response.ok || !result.status) {
      throw new ConvexError(result.message || "Failed to verify transaction");
    }

    //update payment status , order status and delete cart items and update product stock
    await ctx.runMutation(internal.payments.updatePayment.completePayment, {
      paymentId: args.paymentId,
      orderId: args.orderId,
      cartId: args.cartId,
      storeId: args.storeId,
    });

    return result.data;
  },
});

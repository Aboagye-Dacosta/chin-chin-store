import { action, internalAction, mutation } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

type PaystackAuthorizationResponse = {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
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
    gateway_response: string;
    paid_at: string;
    created_at: string;
    channel: string;
    currency: string;
    ip_address: string;
    metadata: string | Record<string, unknown>;
    log: {
      start_time: number;
      time_spent: number;
      attempts: number;
      errors: number;
      success: boolean;
      mobile: boolean;
      input: unknown[];
      history: {
        type: string;
        message: string;
        time: number;
      }[];
    };
    fees: number;
    fees_split: string | null;
    authorization: {
      authorization_code: string;
      bin: string;
      last4: string;
      exp_month: string;
      exp_year: string;
      channel: string;
      card_type: string;
      bank: string;
      country_code: string;
      brand: string;
      reusable: boolean;
      signature: string;
      account_name: string | null;
    };
    customer: {
      id: number;
      first_name: string | null;
      last_name: string | null;
      email: string;
      customer_code: string;
      phone: string | null;
      metadata: unknown;
      risk_action: string;
      international_format_phone: string | null;
    };
    plan: string | null;
    split: Record<string, unknown>;
    order_id: string | null;
    paidAt: string;
    createdAt: string;
    requested_amount: number;
    pos_transaction_data: unknown;
    source: unknown;
    fees_breakdown: unknown;
    connect: unknown;
    transaction_date: string;
    plan_object: Record<string, unknown>;
    subaccount: Record<string, unknown>;
  };
};

// Create Subaccount
export const createSubaccount = internalAction({
  args: {
    vendorId: v.id("vendors"),
  },
  handler: async (ctx, args) => {
    const secretKey = await ctx.runQuery(
      internal.paymentGateway.getPaymentGatewaySettings
    );
    if (!secretKey) {
      throw new Error("Paystack secret key is not configured.");
    }

    const vendor = await ctx.runQuery(internal.vendors.readVendorById, {
      vendorId: args.vendorId,
    });

    if (!vendor?.mobileMoney) {
      throw new Error("Vendor or mobile money details not found.");
    }

    const telcoResponse = await fetch(
      "https://api.paystack.co/bank?currency=GHS&type=mobile_money",
      {
        headers: { Authorization: `Bearer ${secretKey.apiSecret}` },
      }
    );
    const telcos = await telcoResponse.json();
    if (!telcos.status) {
      throw new Error("Failed to fetch supported telcos: " + telcos.message);
    }

    const telco = telcos.data.find((t: any) =>
      t.name.toLowerCase().includes(vendor?.mobileMoney?.provider.toLowerCase())
    );

    if (!telco) {
      throw new Error(
        `Telco ${vendor?.mobileMoney?.provider} not supported by Paystack.`
      );
    }

    const response = await fetch("https://api.paystack.co/subaccount", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey.apiSecret}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        business_name: vendor?.user?.name,
        settlement_bank: telco.code,
        account_number: vendor?.mobileMoney?.phoneNumber,
        percentage_charge: 0,
        primary_contact_email: vendor?.user?.email,
        currency: "GHS",
      }),
    });

    const result = await response.json();
    if (!response.ok || !result.status) {
      throw new Error(result.message || "Failed to create subaccount");
    }

    await ctx.runMutation(internal.vendors.updateVendorRecipientCode, {
      vendorId: args.vendorId,
      recipientCode: result.data.subaccount_code,
    });

  },
});


// Initialize Paystack Transaction with Subaccount
export const initializePaystackTransaction = action({
  args: {
    email: v.string(),
    amount: v.number(),
    vendorId: v.id("vendors"),
    orderId: v.id("orders"),
    reference: v.optional(v.string()),
    callback_url: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<PaystackAuthorizationResponse["data"]> => {
    const secretKey = await ctx.runQuery(
      internal.paymentGateway.getPaymentGatewaySettings
    );
    if (!secretKey) {
      throw new Error("Paystack secret key is not configured.");
    }

    const vendor = await ctx.runQuery(internal.vendors.readVendorById, {
      vendorId: args.vendorId,
    });

    if (!vendor?.paystackRecipientCode) {
      throw new Error("Vendor or Paystack subaccount code not found.");
    }

    const paymentId = await ctx.runMutation(internal.payments.addPayment, {
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
    });

    const response = await fetch(
      "https://api.paystack.co/transaction/initialize",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${secretKey.apiSecret}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: args.email,
          amount: args.amount * 100,
          currency: "GHS",
          reference: args.reference,
          callback_url: args.callback_url,
          subaccount: vendor.paystackRecipientCode, // Use subaccount_code
          transaction_charge: 0, // Platform covers fees, adjust as needed
          metadata: { vendorId: args.vendorId, vendorName: vendor.user?.name },
        }),
      }
    );

    const result: PaystackAuthorizationResponse = await response.json();
    if (!response.ok || !result.status) {
      await ctx.runMutation(internal.payments.updatePaymentStatus, {
        paymentId,
        status: "FAILED",
      });
      throw new Error(result.message || "Failed to initialize transaction");
    }

    return result.data;
  },
});

// Verify Paystack Transaction
export const verifyPaystackTransaction = internalAction({
  args: {
    reference: v.string(),
    paymentId: v.id("payments"),
    vendorId: v.id("vendors"),
  },
  handler: async (ctx, args): Promise<PaystackVerificationResponse["data"]> => {
    const secretKey = await ctx.runQuery(
      internal.paymentGateway.getPaymentGatewaySettings
    );
    if (!secretKey) {
      throw new Error("Paystack secret key is not configured.");
    }

    const vendor = await ctx.runQuery(internal.vendors.readVendorById, {
      vendorId: args.vendorId,
    });
    if (!vendor?.paystackRecipientCode) {
      throw new Error("Vendor or subaccount code not found.");
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
      await ctx.runMutation(internal.payments.updatePaymentStatus, {
        paymentId: args.paymentId,
        status: "FAILED",
      });
      throw new Error(result.message || "Failed to verify transaction");
    }

    await ctx.runMutation(internal.payments.updatePaymentStatus, {
      paymentId: args.paymentId,
      status: result.data.status.toUpperCase() as
        | "PENDING"
        | "PAID"
        | "FAILED"
        | "REFUNDED"
        | "AWAITING_CONFIRMATION",
    });
    return result.data;
  },
});

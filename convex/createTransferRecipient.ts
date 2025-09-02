/**
 * Functions for creating transfer recipients (subaccounts) for vendors.
 */
import { action, internalAction } from "./_generated/server";
import { v, ConvexError } from "convex/values";
import { internal } from "./_generated/api";

/**
 * Creates a subaccount for a vendor on Paystack.
 *
 * @param {object} args - The arguments for the internal action.
 * @param {string} args.vendorId - The ID of the vendor to create the subaccount for.
 * @throws {ConvexError} If Paystack secret key is not configured, vendor or mobile money details are not found,
 * failed to fetch supported telcos, telco not supported by Paystack, or failed to create subaccount.
 */
export const createSubaccount = internalAction({
  args: {
    vendorId: v.id("vendors"),
  },
  handler: async (ctx, args) => {
    const secretKey = await ctx.runQuery(
      internal.paymentGateway.getPaymentGatewaySettings
    );
    if (!secretKey) {
      throw new ConvexError("Paystack secret key is not configured.");
    }

    const vendor = await ctx.runQuery(internal.vendors.readVendorById, {
      vendorId: args.vendorId,
    });

    if (!vendor?.mobileMoney) {
      throw new ConvexError("Vendor or mobile money details not found.");
    }

    const telcoResponse = await fetch(
      "https://api.paystack.co/bank?currency=GHS&type=mobile_money",
      {
        headers: { Authorization: `Bearer ${secretKey.apiSecret}` },
      }
    );
    const telcos = await telcoResponse.json();
    if (!telcos.status) {
      throw new ConvexError(
        "Failed to fetch supported telcos: " + telcos.message
      );
    }

    const telco = telcos.data.find((t: any) =>
      t.name.toLowerCase().includes(vendor?.mobileMoney?.provider.toLowerCase())
    );

    if (!telco) {
      throw new ConvexError(
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
      throw new ConvexError(result.message || "Failed to create subaccount");
    }

    await ctx.runMutation(internal.vendors.updateVendorRecipientCode, {
      vendorId: args.vendorId,
      recipientCode: result.data.subaccount_code,
    });
  },
});

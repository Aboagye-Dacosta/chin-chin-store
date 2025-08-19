import { action, internalAction, mutation } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";


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


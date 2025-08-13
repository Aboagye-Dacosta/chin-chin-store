import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";
import { Webhook } from "svix";

interface ClerkWebhookPayload {
  type: string;
  data: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    username: string | null;
    email_addresses: {
      id: string;
      email_address: string;
      verification: {
        status: string;
      };
    }[];
    primary_email_address_id: string | null;
    created_at: number;
    updated_at: number;
    unsafe_metadata: Record<string, unknown>;
  };
}

export const handleClerkWebhook = httpAction(async (ctx, request) => {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  if (!WEBHOOK_SECRET) throw new Error("Missing CLERK_WEBHOOK_SECRET");

  const svix_id = request.headers.get("svix-id");
  const svix_timestamp = request.headers.get("svix-timestamp");
  const svix_signature = request.headers.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    throw new Error("Missing Svix headers");
  }

  const webhook = new Webhook(WEBHOOK_SECRET);
  let payload: ClerkWebhookPayload;
  try {
    payload = webhook.verify(await request.text(), {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as ClerkWebhookPayload;
  } catch (err) {
    throw new Error(`Webhook verification failed: ${err instanceof Error ? err.message : "Unknown error"}`);
  }

  const { type, data } = payload;

  if (type === "user.created" || type === "user.updated") {
    await ctx.runMutation(api.users.upsertUserFromClerk, {
      clerkId: data.id,
      email: data.email_addresses[0]?.email_address || "",
      name: `${data.first_name || ""} ${data.last_name || ""}`.trim() || "Unknown",
      emailVerified: data.email_addresses[0]?.verification.status === "verified",
      updatedAt: new Date(data.updated_at).toISOString(),
    });
  }

  return new Response(null, { status: 200 });
});
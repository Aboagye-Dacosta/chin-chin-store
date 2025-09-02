import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";
import { Webhook } from "svix";
import { ConvexError } from "convex/values";

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

/**
 * Handles incoming Clerk webhooks.
 *
 * @param {object} ctx - The Convex context.
 * @param {Request} request - The incoming HTTP request.
 * @returns {Response} A HTTP response indicating success or failure.
 * @throws {ConvexError} If CLERK_WEBHOOK_SECRET is missing, Svix headers are missing,
 * webhook verification fails, or an unknown event type is received.
 */
export const handleClerkWebhook = httpAction(async (ctx, request) => {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  if (!WEBHOOK_SECRET) throw new ConvexError("Missing CLERK_WEBHOOK_SECRET");

  const svix_id = request.headers.get("svix-id");
  const svix_timestamp = request.headers.get("svix-timestamp");
  const svix_signature = request.headers.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    throw new ConvexError("Missing Svix headers");
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
    throw new ConvexError(
      `Webhook verification failed: ${err instanceof Error ? err.message : "Unknown error"}`
    );
  }

  const { type, data } = payload;

  if (type === "user.created" || type === "user.updated") {
    await ctx.runMutation(api.users.upsertUserFromClerk, {
      clerkId: data.id,
      email: data.email_addresses[0]?.email_address || "",
      name:
        `${data.first_name || ""} ${data.last_name || ""}`.trim() || "Unknown",
      emailVerified:
        data.email_addresses[0]?.verification.status === "verified",
      updatedAt: new Date(data.updated_at).toISOString(),
    });
  } else {
    throw new ConvexError(`Unknown event type: ${type}`);
  }

  return new Response(null, { status: 200 });
});

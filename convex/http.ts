/**
 * Defines HTTP routes for webhooks.
 */
import { httpRouter } from "convex/server";
import { handleClerkWebhook } from "./handleClerk";

const router = httpRouter();

/**
 * Route for handling Clerk webhooks.
 *
 * @param {object} args - The arguments for the route.
 * @param {string} args.path - The path of the route.
 * @param {string} args.method - The HTTP method of the route.
 * @param {function} args.handler - The handler function for the route.
 */
router.route({
  path: "/clerk",
  method: "POST",
  handler: handleClerkWebhook,
});

export default router;

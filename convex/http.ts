import { httpRouter } from "convex/server";
import { handleClerkWebhook } from "./handleClerk";

const router = httpRouter();

router.route({
  path: "/clerk",
  method: "POST",
  handler: handleClerkWebhook,
});

export default router;

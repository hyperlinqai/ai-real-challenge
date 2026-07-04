import { createPostJsonHandler } from "@/lib/api";
import { eventsRequestSchema } from "@/lib/schemas/events";
import { eventsService } from "@/services/events/events.service";

export const runtime = "nodejs";

export const POST = createPostJsonHandler({
  schema: eventsRequestSchema,
  invalidLabel: "Invalid events request",
  fallbackError: "Event recommendation failed",
  handler: async (data) => eventsService.recommendEvents(data),
});

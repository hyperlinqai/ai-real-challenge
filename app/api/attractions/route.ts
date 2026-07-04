import { createGetJsonHandler } from "@/lib/api";
import { databaseService } from "@/services/database/database.service";

export const runtime = "nodejs";

export const GET = createGetJsonHandler({
  fallbackError: "Failed to load attractions",
  handler: async (request) => {
    const destinationId = new URL(request.url).searchParams.get("destinationId") ?? undefined;
    const attractions = await databaseService.listAttractions(destinationId);
    return { attractions };
  },
});

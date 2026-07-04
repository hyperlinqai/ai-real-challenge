import { createGetJsonHandler } from "@/lib/api";
import { databaseService } from "@/services/database/database.service";

export const runtime = "nodejs";

export const GET = createGetJsonHandler({
  fallbackError: "Failed to load destinations",
  handler: async () => ({
    destinations: await databaseService.listDestinations(),
  }),
});

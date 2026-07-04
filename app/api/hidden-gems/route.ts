import { createPostJsonHandler } from "@/lib/api";
import { hiddenGemsRequestSchema } from "@/lib/schemas/hidden-gems";
import { hiddenGemsService } from "@/services/hidden-gems/hidden-gems.service";

export const runtime = "nodejs";

export const POST = createPostJsonHandler({
  schema: hiddenGemsRequestSchema,
  invalidLabel: "Invalid hidden gems request",
  fallbackError: "Hidden gems search failed",
  handler: async (data) => hiddenGemsService.findGems(data),
});

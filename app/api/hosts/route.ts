import { createPostJsonHandler } from "@/lib/api";
import { hostsRequestSchema } from "@/lib/schemas/hosts";
import { hostsService } from "@/services/hosts/hosts.service";

export const runtime = "nodejs";

export const POST = createPostJsonHandler({
  schema: hostsRequestSchema,
  invalidLabel: "Invalid hosts request",
  fallbackError: "Host matching failed",
  handler: async (data) => hostsService.matchHosts(data),
});

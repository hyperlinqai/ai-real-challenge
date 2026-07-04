import { NextResponse } from "next/server";
import { jsonError, parseJsonBody } from "@/lib/api";
import { ragUserProfileSchema } from "@/lib/schemas/rag";
import { hostsService } from "@/services/hosts/hosts.service";
import { databaseService } from "@/services/database/database.service";
import { fallbackCatalog } from "@/lib/fallback-catalog";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await parseJsonBody<unknown>(request);
  const parsed = ragUserProfileSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("Invalid profile", 400, parsed.error.flatten());
  }

  try {
    const catalog = await databaseService.getDestinationCatalog();
    const dest =
      catalog.find((d) =>
        parsed.data.destinationHint
          ? d.name.toLowerCase().includes(parsed.data.destinationHint.toLowerCase())
          : true,
      ) ?? fallbackCatalog[0];

    const data = await hostsService.matchHosts({
      destinationId: dest.id,
      interests: parsed.data.interests,
      vibe: parsed.data.vibe,
    });
    return NextResponse.json({ ...data, sources: ["Local Database"] });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Host matching failed";
    return jsonError(message, 502);
  }
}

import { NextResponse } from "next/server";
import { clientSafeErrorMessage, jsonError, parseAndValidateBody } from "@/lib/api";
import { ragUserProfileSchema } from "@/lib/schemas/rag";
import { hostsService } from "@/services/hosts/hosts.service";
import { databaseService } from "@/services/database/database.service";
import { fallbackCatalog } from "@/lib/fallback-catalog";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const validated = await parseAndValidateBody(request, ragUserProfileSchema, "Invalid profile");
  if (!validated.ok) return validated.response;

  try {
    const catalog = await databaseService.getDestinationCatalog();
    const dest =
      catalog.find((d) =>
        validated.data.destinationHint
          ? d.name.toLowerCase().includes(validated.data.destinationHint.toLowerCase())
          : true,
      ) ?? fallbackCatalog[0];

    const data = await hostsService.matchHosts({
      destinationId: dest.id,
      interests: validated.data.interests,
      vibe: validated.data.vibe,
    });
    return NextResponse.json({ ...data, sources: ["Local Database"] });
  } catch (error) {
    return jsonError(clientSafeErrorMessage(error, "Host matching failed"), 502);
  }
}

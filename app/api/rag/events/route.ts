import { NextResponse } from "next/server";
import { clientSafeErrorMessage, jsonError, parseAndValidateBody } from "@/lib/api";
import { ragUserProfileSchema } from "@/lib/schemas/rag";
import { eventsService } from "@/services/events/events.service";
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

    const data = await eventsService.recommendEvents({
      destinationId: dest.id,
      interests: validated.data.interests,
      vibe: validated.data.vibe,
    });
    return NextResponse.json({ ...data, sources: ["Local Database", "Events"] });
  } catch (error) {
    return jsonError(clientSafeErrorMessage(error, "Events failed"), 502);
  }
}

import { NextResponse } from "next/server";
import { eventsRequestSchema } from "@/lib/schemas/events";
import { clientSafeErrorMessage, jsonError, parseAndValidateBody } from "@/lib/api";
import { eventsService } from "@/services/events/events.service";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const validated = await parseAndValidateBody(
    request,
    eventsRequestSchema,
    "Invalid events request",
  );
  if (!validated.ok) return validated.response;

  try {
    const data = await eventsService.recommendEvents(validated.data);
    return NextResponse.json(data);
  } catch (error) {
    return jsonError(clientSafeErrorMessage(error, "Event recommendation failed"), 502);
  }
}

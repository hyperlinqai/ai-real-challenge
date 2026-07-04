import { NextResponse } from "next/server";
import { eventsRequestSchema } from "@/lib/schemas/events";
import { jsonError, parseJsonBody } from "@/lib/api";
import { eventsService } from "@/services/events/events.service";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await parseJsonBody<unknown>(request);
  const parsed = eventsRequestSchema.safeParse(body);

  if (!parsed.success) {
    return jsonError("Invalid events request", 400, parsed.error.flatten());
  }

  try {
    const data = await eventsService.recommendEvents(parsed.data);
    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Event recommendation failed";
    return jsonError(message, 502);
  }
}

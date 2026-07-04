import { NextResponse } from "next/server";
import { databaseService } from "@/services/database/database.service";
import { jsonError } from "@/lib/api";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const destinationId = searchParams.get("destinationId") ?? undefined;

  try {
    const attractions = await databaseService.listAttractions(destinationId);
    return NextResponse.json({ attractions });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load attractions";
    return jsonError(message, 500);
  }
}

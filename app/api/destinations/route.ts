import { NextResponse } from "next/server";
import { databaseService } from "@/services/database/database.service";
import { jsonError } from "@/lib/api";

export const runtime = "nodejs";

export async function GET() {
  try {
    const destinations = await databaseService.listDestinations();
    return NextResponse.json({ destinations });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load destinations";
    return jsonError(message, 500);
  }
}

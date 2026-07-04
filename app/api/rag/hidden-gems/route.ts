import { NextResponse } from "next/server";
import { jsonError, parseJsonBody } from "@/lib/api";
import { ragUserProfileSchema } from "@/lib/schemas/rag";
import { hiddenGemsService } from "@/services/hidden-gems/hidden-gems.service";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await parseJsonBody<unknown>(request);
  const parsed = ragUserProfileSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("Invalid profile", 400, parsed.error.flatten());
  }

  try {
    const data = await hiddenGemsService.findGems({
      interests: parsed.data.interests,
      vibe: parsed.data.vibe,
      destinationName: parsed.data.destinationHint,
      limit: 8,
    });
    return NextResponse.json({ ...data, sources: ["Local Database", "Hidden Gems"] });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Hidden gems failed";
    return jsonError(message, 502);
  }
}

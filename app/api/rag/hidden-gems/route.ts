import { NextResponse } from "next/server";
import { clientSafeErrorMessage, jsonError, parseAndValidateBody } from "@/lib/api";
import { ragUserProfileSchema } from "@/lib/schemas/rag";
import { hiddenGemsService } from "@/services/hidden-gems/hidden-gems.service";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const validated = await parseAndValidateBody(request, ragUserProfileSchema, "Invalid profile");
  if (!validated.ok) return validated.response;

  try {
    const data = await hiddenGemsService.findGems({
      interests: validated.data.interests,
      vibe: validated.data.vibe,
      destinationName: validated.data.destinationHint,
      limit: 8,
    });
    return NextResponse.json({ ...data, sources: ["Local Database", "Hidden Gems"] });
  } catch (error) {
    return jsonError(clientSafeErrorMessage(error, "Hidden gems failed"), 502);
  }
}

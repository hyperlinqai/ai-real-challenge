import { NextResponse } from "next/server";
import { hiddenGemsRequestSchema } from "@/lib/schemas/hidden-gems";
import { clientSafeErrorMessage, jsonError, parseAndValidateBody } from "@/lib/api";
import { hiddenGemsService } from "@/services/hidden-gems/hidden-gems.service";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const validated = await parseAndValidateBody(
    request,
    hiddenGemsRequestSchema,
    "Invalid hidden gems request",
  );
  if (!validated.ok) return validated.response;

  try {
    const data = await hiddenGemsService.findGems(validated.data);
    return NextResponse.json(data);
  } catch (error) {
    return jsonError(clientSafeErrorMessage(error, "Hidden gems search failed"), 502);
  }
}

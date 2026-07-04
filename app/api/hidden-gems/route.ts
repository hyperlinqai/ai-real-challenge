import { NextResponse } from "next/server";
import { hiddenGemsRequestSchema } from "@/lib/schemas/hidden-gems";
import { jsonError, parseJsonBody } from "@/lib/api";
import { hiddenGemsService } from "@/services/hidden-gems/hidden-gems.service";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await parseJsonBody<unknown>(request);
  const parsed = hiddenGemsRequestSchema.safeParse(body);

  if (!parsed.success) {
    return jsonError("Invalid hidden gems request", 400, parsed.error.flatten());
  }

  try {
    const data = await hiddenGemsService.findGems(parsed.data);
    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Hidden gems search failed";
    return jsonError(message, 502);
  }
}

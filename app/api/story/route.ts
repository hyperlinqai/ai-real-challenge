import { NextResponse } from "next/server";
import { storyRequestSchema } from "@/lib/schemas/story";
import { clientSafeErrorMessage, jsonError, parseAndValidateBody } from "@/lib/api";
import { storyGeneratorService } from "@/services/story/story-generator.service";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const url = new URL(request.url);
  const stream = url.searchParams.get("stream") === "true";

  const validated = await parseAndValidateBody(request, storyRequestSchema, "Invalid story request");
  if (!validated.ok) return validated.response;

  try {
    if (stream) {
      const result = storyGeneratorService.streamStory(validated.data);
      return result.toTextStreamResponse();
    }

    const data = await storyGeneratorService.generateStory(validated.data);
    return NextResponse.json(data);
  } catch (error) {
    return jsonError(clientSafeErrorMessage(error, "Story generation failed"), 502);
  }
}

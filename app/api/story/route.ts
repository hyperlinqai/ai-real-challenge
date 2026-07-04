import { NextResponse } from "next/server";
import { storyRequestSchema } from "@/lib/schemas/story";
import { jsonError, parseJsonBody } from "@/lib/api";
import { storyGeneratorService } from "@/services/story/story-generator.service";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const url = new URL(request.url);
  const stream = url.searchParams.get("stream") === "true";

  const body = await parseJsonBody<unknown>(request);
  const parsed = storyRequestSchema.safeParse(body);

  if (!parsed.success) {
    return jsonError("Invalid story request", 400, parsed.error.flatten());
  }

  try {
    if (stream) {
      const result = storyGeneratorService.streamStory(parsed.data);
      return result.toTextStreamResponse();
    }

    const data = await storyGeneratorService.generateStory(parsed.data);
    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Story generation failed";
    return jsonError(message, 502);
  }
}

import { NextResponse } from "next/server";
import { hostsRequestSchema } from "@/lib/schemas/hosts";
import { jsonError, parseJsonBody } from "@/lib/api";
import { hostsService } from "@/services/hosts/hosts.service";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await parseJsonBody<unknown>(request);
  const parsed = hostsRequestSchema.safeParse(body);

  if (!parsed.success) {
    return jsonError("Invalid hosts request", 400, parsed.error.flatten());
  }

  try {
    const data = await hostsService.matchHosts(parsed.data);
    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Host matching failed";
    return jsonError(message, 502);
  }
}

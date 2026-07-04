import { NextResponse } from "next/server";
import { hostsRequestSchema } from "@/lib/schemas/hosts";
import { clientSafeErrorMessage, jsonError, parseAndValidateBody } from "@/lib/api";
import { hostsService } from "@/services/hosts/hosts.service";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const validated = await parseAndValidateBody(request, hostsRequestSchema, "Invalid hosts request");
  if (!validated.ok) return validated.response;

  try {
    const data = await hostsService.matchHosts(validated.data);
    return NextResponse.json(data);
  } catch (error) {
    return jsonError(clientSafeErrorMessage(error, "Host matching failed"), 502);
  }
}

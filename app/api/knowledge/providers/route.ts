import { NextResponse } from "next/server";
import { knowledgeService } from "@/services/knowledge/knowledge.service";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({ providers: knowledgeService.listProviders() });
}

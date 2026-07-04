import { NextResponse } from "next/server";

export function jsonError(message: string, status = 500, details?: unknown) {
  return NextResponse.json(
    { error: message, details: details ?? undefined },
    { status },
  );
}

export async function parseJsonBody<T>(request: Request): Promise<T | null> {
  try {
    return (await request.json()) as T;
  } catch {
    return null;
  }
}

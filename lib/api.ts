import { NextResponse } from "next/server";
import type { ZodType } from "zod";

export function jsonError(message: string, status = 500, details?: unknown) {
  return NextResponse.json(
    { error: message, details: details ?? undefined },
    { status },
  );
}

/** Avoid leaking provider/DB internals to clients in production. */
export function clientSafeErrorMessage(error: unknown, fallback: string): string {
  if (process.env.NODE_ENV !== "production" && error instanceof Error) {
    return error.message;
  }
  return fallback;
}

export async function parseJsonBody<T>(request: Request): Promise<T | null> {
  try {
    return (await request.json()) as T;
  } catch {
    return null;
  }
}

export async function parseAndValidateBody<T>(
  request: Request,
  schema: ZodType<T>,
  invalidLabel = "Invalid request body",
): Promise<
  | { ok: true; data: T }
  | { ok: false; response: NextResponse }
> {
  const body = await parseJsonBody<unknown>(request);
  if (body === null) {
    return { ok: false, response: jsonError("Malformed or empty JSON body", 400) };
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return {
      ok: false,
      response: jsonError(invalidLabel, 400, parsed.error.flatten()),
    };
  }

  return { ok: true, data: parsed.data };
}

/** Shared POST JSON pipeline: validate → execute → JSON or safe 502. */
export function createPostJsonHandler<T>(options: {
  schema: ZodType<T>;
  invalidLabel?: string;
  fallbackError: string;
  handler: (data: T, request: Request) => Promise<unknown>;
}) {
  return async function POST(request: Request): Promise<NextResponse> {
    const validated = await parseAndValidateBody(
      request,
      options.schema,
      options.invalidLabel,
    );
    if (!validated.ok) return validated.response;

    try {
      const payload = await options.handler(validated.data, request);
      return NextResponse.json(payload);
    } catch (error) {
      return jsonError(clientSafeErrorMessage(error, options.fallbackError), 502);
    }
  };
}

/** Shared GET pipeline with production-safe 500 errors. */
export function createGetJsonHandler(options: {
  fallbackError: string;
  handler: (request: Request) => Promise<unknown>;
}) {
  return async function GET(request: Request): Promise<NextResponse> {
    try {
      const payload = await options.handler(request);
      return NextResponse.json(payload);
    } catch (error) {
      return jsonError(clientSafeErrorMessage(error, options.fallbackError), 500);
    }
  };
}

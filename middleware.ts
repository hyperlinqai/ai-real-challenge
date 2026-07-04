import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { createRateLimiter } from "@/lib/rate-limit";

const limiter = createRateLimiter({
  interval: 60_000,
  limit: Number(process.env.API_RATE_LIMIT_PER_MINUTE ?? 120),
});

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "anonymous";

  const { success, remaining, resetAt } = limiter.check(ip);
  if (!success) {
    return NextResponse.json(
      { error: "Too many requests. Please try again shortly." },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((resetAt - Date.now()) / 1000)),
        },
      },
    );
  }

  const response = NextResponse.next();
  response.headers.set("X-RateLimit-Remaining", String(remaining));
  return response;
}

export const config = {
  matcher: "/api/:path*",
};

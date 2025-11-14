import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const securityHeaders: Record<string, string> = {
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "no-referrer",
  "Permissions-Policy": [
    "accelerometer=()",
    "camera=()",
    "geolocation=()",
    "microphone=()",
    "payment=()",
    "usb=()",
  ].join(", "),
};

function isSecureRequest(request: NextRequest) {
  const protoHeader = request.headers.get("x-forwarded-proto");
  if (protoHeader) {
    return protoHeader.includes("https");
  }
  return request.nextUrl.protocol === "https:";
}

export function middleware(request: NextRequest) {
  const isProd = process.env.NODE_ENV === "production";
  const mustRedirectToHttps = isProd && !isSecureRequest(request) && request.nextUrl.hostname !== "localhost";
  const response = mustRedirectToHttps
    ? (() => {
        const url = request.nextUrl.clone();
        url.protocol = "https:";
        return NextResponse.redirect(url, 308);
      })()
    : NextResponse.next();

  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

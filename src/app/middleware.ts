import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getTokenFromHeaders, verifyJwt } from "@/lib/auth";

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
  const pathname = request.nextUrl.pathname;

  // Proteger TODAS las rutas administrativas excepto la pantalla de acceso
  // Esto cierra el acceso público al panel admin y sus sub-rutas
  const isAdminRoute = pathname.startsWith("/admin") && pathname !== "/admin/access";
  if (isAdminRoute) {
    let isAdmin = false;
    try {
      const token = getTokenFromHeaders(request.headers);
      const payload = token ? verifyJwt(token) : null;
      isAdmin = payload?.role === "admin";
    } catch {
      isAdmin = false;
    }
    if (!isAdmin) {
      const url = new URL("/admin/access", request.nextUrl.origin);
      url.searchParams.set("returnUrl", pathname);
      return NextResponse.redirect(url, 302);
    }
  }

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

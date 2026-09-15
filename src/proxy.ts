/**
 * Proxy — Request Interceptor (Next.js 16)
 * 
 * Auth Protection with Optimistic Cookie Check.
 * Handles Better Auth 1.7+ cookie names (__Secure- prefix in production).
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// ═══════════════════════════════════════════════════════════
// PROXY FUNCTION
// ═══════════════════════════════════════════════════════════

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ─────────────────────────────────────────────
  // PUBLIC ROUTES
  // ─────────────────────────────────────────────
  const publicRoutes = ["/login", "/login/verify"];
  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // ─────────────────────────────────────────────
  // API ROUTES
  // ─────────────────────────────────────────────
  const isApiRoute = pathname.startsWith("/api");

  if (isPublicRoute || isApiRoute) {
    return NextResponse.next();
  }

  // ─────────────────────────────────────────────
  // OPTIMISTIC AUTH CHECK
  // ─────────────────────────────────────────────
  // Better Auth 1.7+ uses __Secure- prefix on HTTPS
  const cookieNames = [
    "better-auth.session_token",              // Dev / HTTP
    "__Secure-better-auth.session_token",     // Production / HTTPS
  ];

  const hasSession = cookieNames.some((name) =>
    request.cookies.get(name)
  );

  if (!hasSession) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// ═══════════════════════════════════════════════════════════
// MATCHER CONFIG
// ═══════════════════════════════════════════════════════════

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|manifest.json|icons|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
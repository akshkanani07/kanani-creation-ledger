/**
 * Proxy — Request Interceptor (Next.js 16)
 * 
 * WHY "PROXY" INSTEAD OF "MIDDLEWARE":
 * Next.js 16 renamed `middleware.ts` → `proxy.ts` to clarify that this
 * file acts as a network boundary/proxy layer in front of the app.
 * The exported function MUST be named `proxy` or be a default export.
 * 
 * WHAT THIS DOES:
 * - Protects dashboard routes from unauthenticated access
 * - Optimistic redirect to /login if no session cookie exists
 * - Does NOT fetch full session (that's done in pages/layouts)
 * 
 * SECURITY NOTE:
 * Proxy provides "optimistic" protection only. Real auth checks
 * happen in each protected page/layout. This is Next.js's recommended
 * approach — proxy should NOT be a full auth solution.
 * 
 * USAGE:
 *   Runs on every matched request automatically.
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ============================================================
  // PUBLIC ROUTES (No auth required)
  // ============================================================
  const publicRoutes = ["/login", "/login/verify"];
  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // ============================================================
  // API ROUTES (Handled separately by Better Auth)
  // ============================================================
  const isApiRoute = pathname.startsWith("/api");

  // Allow public and API routes
  if (isPublicRoute || isApiRoute) {
    return NextResponse.next();
  }

  // ============================================================
  // OPTIMISTIC AUTH CHECK
  // ============================================================
  // Check for session cookie (fast, no DB call)
  const sessionCookie = request.cookies.get("better-auth.session_token");

  if (!sessionCookie) {
    // No session → redirect to login
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Session cookie exists → continue
  return NextResponse.next();
}

// ============================================================
// MATCHER CONFIG
// ============================================================

export const config = {
  /**
   * Run proxy on all routes EXCEPT:
   * - /api/* (handled by API routes)
   * - /_next/* (static assets)
   * - /favicon.ico, /manifest.json (static files)
   * - Files with extensions (.png, .jpg, .svg, etc.)
   */
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|manifest.json|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
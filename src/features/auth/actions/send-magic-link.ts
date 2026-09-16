"use server";

/**
 * Send Magic Link Server Action
 *
 * FIXED VERSION (works on BOTH localhost & Vercel):
 * - Priority 1: NEXT_PUBLIC_APP_URL from env (if set)
 * - Priority 2: Auto-detect from request headers (x-forwarded-proto + host)
 * - Priority 3: Fallback to localhost
 *
 * CRITICAL:
 * - callbackURL must be FULL URL (not relative)
 * - HTTPS on Vercel, HTTP on localhost — auto-detected
 */

import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { env } from "@/config/env";
import type { ApiResponse } from "@/types";

// ═══════════════════════════════════════════════════════════
// HELPER: Resolve App URL (works on localhost + Vercel)
// ═══════════════════════════════════════════════════════════

async function resolveAppUrl(): Promise<string> {
  // ── Priority 1: Env var (if explicitly set) ──
  const envUrl = env.NEXT_PUBLIC_APP_URL?.trim();
  if (envUrl) {
    // Strip trailing slash
    const clean = envUrl.replace(/\/+$/, "");

    // Guard: if env says "https://localhost", fix it to http
    if (clean.startsWith("https://localhost")) {
      return clean.replace("https://localhost", "http://localhost");
    }
    if (clean.startsWith("https://127.0.0.1")) {
      return clean.replace("https://127.0.0.1", "http://127.0.0.1");
    }

    return clean;
  }

  // ── Priority 2: Auto-detect from request headers ──
  try {
    const h = await headers();
    const host = h.get("x-forwarded-host") ?? h.get("host");
    const proto =
      h.get("x-forwarded-proto") ??
      (host?.includes("localhost") || host?.includes("127.0.0.1")
        ? "http"
        : "https");

    if (host) {
      return `${proto}://${host}`;
    }
  } catch {
    // headers() unavailable outside request scope — ignore
  }

  // ── Priority 3: Fallback ──
  return "http://localhost:3000";
}

// ═══════════════════════════════════════════════════════════
// SERVER ACTION
// ═══════════════════════════════════════════════════════════

export async function sendMagicLink(): Promise<ApiResponse> {
  try {
    // ═══════════════════════════════════════════
    // STEP 1: FETCH CURRENT OWNER FROM DATABASE
    // ═══════════════════════════════════════════
    const owner = await prisma.user.findFirst({
      select: {
        id: true,
        email: true,
        name: true,
        emailVerified: true,
      },
    });

    // ═══════════════════════════════════════════
    // STEP 2: DETERMINE EMAIL
    // ═══════════════════════════════════════════
    let targetEmail: string;

    if (owner?.email) {
      targetEmail = owner.email;
      console.log(`[SendMagicLink] Using DB email: ${targetEmail}`);
    } else if (env.OWNER_EMAIL) {
      targetEmail = env.OWNER_EMAIL;
      console.log(`[SendMagicLink] Using env fallback: ${targetEmail}`);
    } else {
      return {
        success: false,
        error: "Owner email not configured",
      };
    }

    // ═══════════════════════════════════════════
    // STEP 3: DETERMINE APP URL (auto localhost/Vercel)
    // ═══════════════════════════════════════════
    const appUrl = await resolveAppUrl();
    console.log(`[SendMagicLink] App URL: ${appUrl}`);

    // ═══════════════════════════════════════════
    // STEP 4: SEND MAGIC LINK
    // ═══════════════════════════════════════════
    await auth.api.signInMagicLink({
      body: {
        email: targetEmail,
        // ⚠️ CRITICAL: Full URL — not relative
        callbackURL: `${appUrl}/dashboard`,
      },
      headers: await headers(),
    });

    return {
      success: true,
      data: undefined,
      message: "Magic link sent successfully",
    };
  } catch (error) {
    console.error("[SendMagicLink] Error:", error);

    const message =
      error instanceof Error ? error.message : "Failed to send magic link";

    return {
      success: false,
      error: message,
    };
  }
}
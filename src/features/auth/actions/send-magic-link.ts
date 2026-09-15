"use server";

/**
 * Send Magic Link Server Action
 * 
 * FIXED VERSION:
 * - Uses absolute URL with explicit origin
 * - Sets callbackURL dynamically based on env
 * - Ensures Magic Link redirects to correct domain (Vercel or localhost)
 * 
 * CRITICAL FIX:
 * - callbackURL must be FULL URL (not relative)
 * - Uses NEXT_PUBLIC_APP_URL from env
 */

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { env } from "@/config/env";
import type { ApiResponse } from "@/types";

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
    // STEP 3: DETERMINE APP URL (CRITICAL FIX)
    // ═══════════════════════════════════════════
    // Use NEXT_PUBLIC_APP_URL from env — Vercel or localhost
    const appUrl = env.NEXT_PUBLIC_APP_URL;

    if (!appUrl) {
      return {
        success: false,
        error: "NEXT_PUBLIC_APP_URL is not configured",
      };
    }

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
      headers: new Headers(),
    });

    return {
      success: true,
      data: undefined,
      message: "Magic link sent successfully",
    };
  } catch (error) {
    console.error("[SendMagicLink] Error:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Failed to send magic link";

    return {
      success: false,
      error: message,
    };
  }
}
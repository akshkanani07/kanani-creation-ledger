"use server";

/**
 * Send Magic Link Server Action
 * 
 * Sends a magic link to the CURRENT OWNER EMAIL from DATABASE.
 * 
 * CRITICAL:
 * - Fetches email dynamically from database
 * - Supports email changes (new email gets link)
 * - Falls back to env.OWNER_EMAIL if DB empty (initial setup)
 * 
 * USAGE:
 *   const result = await sendMagicLink();
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
      // ✅ Use current DB email (reflects changes)
      targetEmail = owner.email;
      console.log(`[SendMagicLink] Using DB email: ${targetEmail}`);
    } else if (env.OWNER_EMAIL) {
      // ⚠️ Fallback — First time setup
      targetEmail = env.OWNER_EMAIL;
      console.log(`[SendMagicLink] Using env fallback: ${targetEmail}`);
    } else {
      return {
        success: false,
        error: "Owner email not configured",
      };
    }

    // ═══════════════════════════════════════════
    // STEP 3: SEND MAGIC LINK
    // ═══════════════════════════════════════════
    await auth.api.signInMagicLink({
      body: {
        email: targetEmail,
        callbackURL: "/dashboard", // ← Explicit Dashboard Redirect
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
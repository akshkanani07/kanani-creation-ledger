"use server";

/**
 * Send Magic Link Server Action
 * 
 * Sends a magic link to the pre-registered OWNER_EMAIL.
 */

import { auth } from "@/lib/auth";
import { env } from "@/config/env";
import type { ApiResponse } from "@/types";

export async function sendMagicLink(): Promise<ApiResponse> {
  try {
    await auth.api.signInMagicLink({
      body: {
        email: env.OWNER_EMAIL,
        callbackURL: "/",
      },
    });

    return {
      success: true,
      data: undefined,
      message: "Magic link sent successfully",
    };
  } catch (error) {
    console.error("[Send Magic Link] Error:", error);

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
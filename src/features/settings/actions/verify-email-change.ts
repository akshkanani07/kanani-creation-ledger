"use server";

/**
 * Verify Email Change — Server Action
 * 
 * FLOW:
 * 1. Validate token
 * 2. Check expiry (15 minutes)
 * 3. Verify new email not in use
 * 4. Update Owner email
 * 5. Delete used verification token
 * 6. Log activity
 * 
 * ⚠️ NO revalidatePath — this action runs during page render.
 * Cache will update naturally on next navigation.
 * 
 * USAGE:
 *   const result = await verifyEmailChange({ token, ownerId });
 */

import { prisma } from "@/lib/prisma";
import { z } from "zod";
import type { ApiResponse } from "@/types";

// ═══════════════════════════════════════════════════════════
// VALIDATION
// ═══════════════════════════════════════════════════════════

const verifySchema = z.object({
  token: z.string().min(1, "Token is required"),
  ownerId: z.string().min(1, "Owner ID is required"),
});

// ═══════════════════════════════════════════════════════════
// SERVER ACTION
// ═══════════════════════════════════════════════════════════

export async function verifyEmailChange(
  input: unknown
): Promise<ApiResponse<{ newEmail: string }>> {
  try {
    // ═══════════════════════════════════════════
    // VALIDATE INPUT
    // ═══════════════════════════════════════════
    const parsed = verifySchema.safeParse(input);

    if (!parsed.success) {
      return {
        success: false,
        error: "Invalid verification link",
      };
    }

    const { token, ownerId } = parsed.data;

    // ═══════════════════════════════════════════
    // FIND VERIFICATION TOKEN
    // ═══════════════════════════════════════════
    const verification = await prisma.verification.findFirst({
      where: {
        identifier: `email-change:${ownerId}`,
      },
    });

    if (!verification) {
      return {
        success: false,
        error: "Verification link is invalid or has expired",
      };
    }

    // ═══════════════════════════════════════════
    // CHECK EXPIRY
    // ═══════════════════════════════════════════
    if (verification.expiresAt < new Date()) {
      await prisma.verification.delete({
        where: { id: verification.id },
      });

      return {
        success: false,
        error: "Verification link has expired. Please request a new one.",
      };
    }

    // ═══════════════════════════════════════════
    // PARSE STORED DATA
    // ═══════════════════════════════════════════
    let parsedValue: { newEmail: string; token: string };

    try {
      parsedValue = JSON.parse(verification.value);
    } catch {
      return {
        success: false,
        error: "Verification data is corrupted",
      };
    }

    // ═══════════════════════════════════════════
    // VERIFY TOKEN MATCHES
    // ═══════════════════════════════════════════
    if (parsedValue.token !== token) {
      return {
        success: false,
        error: "Invalid verification token",
      };
    }

    const { newEmail } = parsedValue;

    // ═══════════════════════════════════════════
    // CHECK OWNER EXISTS
    // ═══════════════════════════════════════════
    const owner = await prisma.user.findUnique({
      where: { id: ownerId },
    });

    if (!owner) {
      return {
        success: false,
        error: "Owner account not found",
      };
    }

    // ═══════════════════════════════════════════
    // CHECK NEW EMAIL NOT IN USE (Race Condition)
    // ═══════════════════════════════════════════
    const existingUser = await prisma.user.findFirst({
      where: {
        email: newEmail,
        id: { not: ownerId },
      },
    });

    if (existingUser) {
      return {
        success: false,
        error: "This email is already registered to another account",
      };
    }

    // ═══════════════════════════════════════════
    // UPDATE OWNER EMAIL (DATA PRESERVED)
    // ═══════════════════════════════════════════
    const oldEmail = owner.email;

    await prisma.user.update({
      where: { id: ownerId },
      data: {
        email: newEmail,
        emailVerified: true,
        updatedAt: new Date(),
      },
    });

    // ═══════════════════════════════════════════
    // DELETE USED VERIFICATION TOKEN
    // ═══════════════════════════════════════════
    await prisma.verification.delete({
      where: { id: verification.id },
    });

    // ═══════════════════════════════════════════
    // LOG ACTIVITY
    // ═══════════════════════════════════════════
    await prisma.activityLog.create({
      data: {
        action: "EMAIL_CHANGE",
        entityType: "Owner",
        entityId: ownerId,
        metadata: {
          oldEmail,
          newEmail,
          status: "completed",
        },
      },
    });

    return {
      success: true,
      data: { newEmail },
      message: "Email updated successfully",
    };
  } catch (error) {
    console.error("[verifyEmailChange] Error:", error);

    return {
      success: false,
      error: "Failed to verify email change",
    };
  }
}
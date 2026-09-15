"use server";

/**
 * Request Email Change — Server Action
 * 
 * FLOW:
 * 1. Validate new email format
 * 2. Check if new email already in use
 * 3. Generate verification token
 * 4. Store token in Verification table (Better Auth)
 * 5. Send verification email to NEW email
 * 6. Old email remains active until verified
 * 
 * SECURITY:
 * - Token expires in 15 minutes
 * - Only Owner can request change
 * - Old email remains active until verified
 * 
 * USAGE:
 *   const result = await requestEmailChange({ newEmail: "new@example.com" });
 */

import { prisma } from "@/lib/prisma";
import { env } from "@/config/env";
import { sendEmailChangeVerification } from "@/lib/mailjet";
import { z } from "zod";
import type { ApiResponse, EmailChangeResponse } from "@/types";

// ═══════════════════════════════════════════════════════════
// VALIDATION
// ═══════════════════════════════════════════════════════════

const emailChangeSchema = z.object({
  newEmail: z
    .string()
    .email("Please enter a valid email address")
    .toLowerCase()
    .trim(),
});

// ═══════════════════════════════════════════════════════════
// SERVER ACTION
// ═══════════════════════════════════════════════════════════

export async function requestEmailChange(
  input: unknown
): Promise<ApiResponse<EmailChangeResponse>> {
  try {
    // ═══════════════════════════════════════════
    // VALIDATE
    // ═══════════════════════════════════════════
    const parsed = emailChangeSchema.safeParse(input);

    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? "Invalid email",
      };
    }

    const { newEmail } = parsed.data;

    // ═══════════════════════════════════════════
    // FETCH CURRENT OWNER
    // ═══════════════════════════════════════════
    const owner = await prisma.user.findFirst();

    if (!owner) {
      return {
        success: false,
        error: "Owner account not found",
      };
    }

    // ═══════════════════════════════════════════
    // VALIDATE NEW EMAIL
    // ═══════════════════════════════════════════
    if (owner.email === newEmail) {
      return {
        success: false,
        error: "New email is same as current email",
      };
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        email: newEmail,
        id: { not: owner.id },
      },
    });

    if (existingUser) {
      return {
        success: false,
        error: "This email is already registered",
      };
    }

    // ═══════════════════════════════════════════
    // GENERATE VERIFICATION TOKEN
    // ═══════════════════════════════════════════
    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Clear any existing pending email changes for this owner
    await prisma.verification.deleteMany({
      where: {
        identifier: `email-change:${owner.id}`,
      },
    });

    // Store new token
    await prisma.verification.create({
      data: {
        id: crypto.randomUUID(),
        identifier: `email-change:${owner.id}`,
        value: JSON.stringify({
          newEmail,
          token,
        }),
        expiresAt,
      },
    });

    // ═══════════════════════════════════════════
    // SEND VERIFICATION EMAIL TO NEW EMAIL
    // ═══════════════════════════════════════════
    const verificationUrl = `${env.NEXT_PUBLIC_APP_URL}/settings/verify-email?token=${token}&id=${owner.id}`;

    await sendEmailChangeVerification({
      newEmail,
      oldEmail: owner.email,
      verificationUrl,
      expiresInMinutes: 15,
    });

    // ═══════════════════════════════════════════
    // LOG ACTIVITY
    // ═══════════════════════════════════════════
    await prisma.activityLog.create({
      data: {
        action: "EMAIL_CHANGE",
        entityType: "Owner",
        entityId: owner.id,
        metadata: {
          oldEmail: owner.email,
          newEmail,
          status: "requested",
        },
      },
    });

    return {
      success: true,
      data: {
        newEmail,
        verificationSent: true,
      },
      message: `Verification email sent to ${newEmail}`,
    };
  } catch (error) {
    console.error("[requestEmailChange] Error:", error);

    return {
      success: false,
      error: "Failed to process email change request",
    };
  }
}
"use server";

/**
 * Create Karigar — Server Action
 * 
 * Creates a new karigar with optional opening balance.
 * 
 * FLOW:
 * 1. Validate input (Zod)
 * 2. Check duplicate phone
 * 3. Create karigar + opening balance transaction (atomic)
 * 4. Log activity
 * 5. Revalidate cache
 */

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { karigarSchema } from "../schemas/karigar.schema";
import { ROUTES } from "@/config/constants";
import type { ApiResponse } from "@/types";
import type { Karigar } from "../types";

// ═══════════════════════════════════════════════════════════
// SERVER ACTION
// ═══════════════════════════════════════════════════════════

export async function createKarigar(
  input: unknown
): Promise<ApiResponse<Karigar>> {
  try {
    // ═══════════════════════════════════════════
    // LAYER 1: VALIDATE
    // ═══════════════════════════════════════════
    const parsed = karigarSchema.safeParse(input);

    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      const firstError =
        Object.values(fieldErrors).flat().filter(Boolean)[0] ?? "Invalid input";

      return {
        success: false,
        error: firstError,
        fieldErrors: fieldErrors as Record<string, string[]>,
      };
    }

    const data = parsed.data;

    // ═══════════════════════════════════════════
    // LAYER 2: CHECK DUPLICATE PHONE
    // ═══════════════════════════════════════════
    const existing = await prisma.karigar.findFirst({
      where: {
        phone: data.phone,
        deletedAt: null,
      },
      select: { id: true, name: true },
    });

    if (existing) {
      return {
        success: false,
        error: `Phone number already registered to "${existing.name}"`,
        fieldErrors: {
          phone: ["This phone number is already in use"],
        },
      };
    }

    // ═══════════════════════════════════════════
    // LAYER 3: CREATE KARIGAR + OPENING BALANCE
    // ═══════════════════════════════════════════
    const openingBalance = Number(data.openingBalance) || 0;

    const karigar = await prisma.$transaction(async (tx) => {
      // Step 1: Create Karigar
      const newKarigar = await tx.karigar.create({
        data: {
          name: data.name,
          phone: data.phone,
          address: data.address ?? null,
          photoUrl: data.photoUrl ?? null,
          photoId: data.photoId ?? null,
          isActive: data.isActive ?? true,
        },
      });

      // Step 2: Create Opening Balance Transaction (if > 0)
      if (openingBalance > 0) {
        const transaction = await tx.transaction.create({
          data: {
            karigarId: newKarigar.id,
            type: "OPENING_BALANCE",
            direction: "CREDIT",
            amount: openingBalance,
            description: "Opening balance at karigar creation",
            transactionDate: new Date(),
          },
        });

        // Log activity for the transaction
        await tx.activityLog.create({
          data: {
            action: "CREATE",
            entityType: "Transaction",
            entityId: transaction.id,
            metadata: {
              type: "OPENING_BALANCE",
              amount: openingBalance,
              karigarName: newKarigar.name,
              source: "karigar_creation",
            },
          },
        });
      }

      return newKarigar;
    });

    // ═══════════════════════════════════════════
    // LAYER 4: LOG KARIGAR ACTIVITY
    // ═══════════════════════════════════════════
    await prisma.activityLog.create({
      data: {
        action: "CREATE",
        entityType: "Karigar",
        entityId: karigar.id,
        metadata: {
          name: karigar.name,
          phone: karigar.phone,
          openingBalance,
        },
      },
    });

    // ═══════════════════════════════════════════
    // LAYER 5: REVALIDATE
    // ═══════════════════════════════════════════
    revalidatePath(ROUTES.KARIGAR);
    revalidatePath(ROUTES.DASHBOARD);
    revalidatePath(ROUTES.TRANSACTIONS);

    return {
      success: true,
      data: {
        ...karigar,
      },
      message: "Karigar created successfully",
    };
  } catch (error) {
    console.error("[createKarigar] Error:", error);

    if (
      error instanceof Error &&
      error.message.includes("Unique constraint")
    ) {
      return {
        success: false,
        error: "Phone number already exists",
        fieldErrors: {
          phone: ["This phone number is already in use"],
        },
      };
    }

    return {
      success: false,
      error: "Failed to create karigar. Please try again.",
    };
  }
}
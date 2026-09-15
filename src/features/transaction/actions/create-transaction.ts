"use server";

/**
 * Create Transaction — Server Action
 * 
 * Creates a new transaction with validation.
 * 
 * BUSINESS RULES:
 * - Karigar must exist and not be deleted
 * - Direction auto-derived from type (if not provided)
 * - Amount must be positive
 * - Work requires quantity + rate
 * - Payment/Advance require payment mode
 * - Logs activity for audit trail
 * 
 * FLOW:
 * 1. Validate input (Zod)
 * 2. Check karigar exists + active
 * 3. Auto-derive direction from type
 * 4. Insert transaction
 * 5. Log activity
 * 6. Revalidate cache
 * 
 * USAGE:
 *   const result = await createTransaction(formData);
 *   if (result.success) { redirect("/transactions"); }
 */

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  transactionSchema,
  TYPE_DEFAULT_DIRECTION,
} from "../schemas/transaction.schema";
import { ROUTES } from "@/config/constants";
import type { ApiResponse } from "@/types";
import type { Transaction } from "../types";

// ═══════════════════════════════════════════════════════════
// SERVER ACTION
// ═══════════════════════════════════════════════════════════

export async function createTransaction(
  input: unknown
): Promise<ApiResponse<Transaction>> {
  try {
    // ═══════════════════════════════════════════
    // LAYER 1: VALIDATE
    // ═══════════════════════════════════════════
    const parsed = transactionSchema.safeParse(input);

    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      const firstError =
        Object.values(fieldErrors).flat().filter(Boolean)[0] ??
        "Invalid input";

      return {
        success: false,
        error: firstError,
        fieldErrors: fieldErrors as Record<string, string[]>,
      };
    }

    const data = parsed.data;

    // ═══════════════════════════════════════════
    // LAYER 2: VERIFY KARIGAR EXISTS
    // ═══════════════════════════════════════════
    const karigar = await prisma.karigar.findFirst({
      where: {
        id: data.karigarId,
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        isActive: true,
      },
    });

    if (!karigar) {
      return {
        success: false,
        error: "Karigar not found or has been deleted",
        fieldErrors: {
          karigarId: ["Karigar not found"],
        },
      };
    }

    if (!karigar.isActive) {
      return {
        success: false,
        error: `"${karigar.name}" is inactive. Cannot add transactions.`,
        fieldErrors: {
          karigarId: ["This karigar is inactive"],
        },
      };
    }

    // ═══════════════════════════════════════════
    // LAYER 3: AUTO-DERIVE DIRECTION
    // ═══════════════════════════════════════════
    const direction =
      data.direction ?? TYPE_DEFAULT_DIRECTION[data.type];

    // ═══════════════════════════════════════════
    // LAYER 4: CREATE TRANSACTION
    // ═══════════════════════════════════════════
    const transaction = await prisma.transaction.create({
      data: {
        karigarId: data.karigarId,
        type: data.type,
        direction,
        amount: data.amount,
        quantity: data.quantity ?? null,
        rate: data.rate ?? null,
        paymentMode: data.paymentMode ?? null,
        reference: data.reference ?? null,
        description: data.description,
        transactionDate: data.transactionDate ?? new Date(),
      },
    });

    // ═══════════════════════════════════════════
    // LAYER 5: LOG ACTIVITY
    // ═══════════════════════════════════════════
    await prisma.activityLog.create({
      data: {
        action: "CREATE",
        entityType: "Transaction",
        entityId: transaction.id,
        metadata: {
          karigarId: karigar.id,
          karigarName: karigar.name,
          type: data.type,
          direction,
          amount: data.amount,
          description: data.description,
        },
      },
    });

    // ═══════════════════════════════════════════
    // LAYER 6: REVALIDATE CACHE
    // ═══════════════════════════════════════════
    revalidatePath(ROUTES.TRANSACTIONS);
    revalidatePath(ROUTES.DASHBOARD);
    revalidatePath(ROUTES.KARIGAR_DETAIL(karigar.id));
    revalidatePath(ROUTES.LEDGER_DETAIL(karigar.id));

    // ═══════════════════════════════════════════
    // SERIALIZE RESPONSE
    // ═══════════════════════════════════════════
    const serialized: Transaction = {
      id: transaction.id,
      karigarId: transaction.karigarId,
      type: transaction.type,
      direction: transaction.direction,
      amount: Number(transaction.amount),
      quantity: transaction.quantity ? Number(transaction.quantity) : null,
      rate: transaction.rate ? Number(transaction.rate) : null,
      paymentMode: transaction.paymentMode,
      reference: transaction.reference,
      description: transaction.description,
      transactionDate: transaction.transactionDate,
      deletedAt: transaction.deletedAt,
      createdAt: transaction.createdAt,
      updatedAt: transaction.updatedAt,
    };

    return {
      success: true,
      data: serialized,
      message: "Transaction created successfully",
    };
  } catch (error) {
    console.error("[createTransaction] Error:", error);

    return {
      success: false,
      error: "Failed to create transaction. Please try again.",
    };
  }
}
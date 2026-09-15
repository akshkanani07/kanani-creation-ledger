"use server";

/**
 * Update Transaction — Server Action
 * 
 * Updates an existing transaction.
 * 
 * BUSINESS RULES:
 * - Transaction must exist and not be deleted
 * - Karigar must exist and be active
 * - Direction auto-derived if type changed
 * - Tracks changes for audit trail
 * - Prevents amount tampering on soft-deleted transactions
 * 
 * USAGE:
 *   const result = await updateTransaction({ id, ...data });
 *   if (result.success) { redirect("/transactions"); }
 */

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { transactionUpdateSchema } from "../schemas/transaction.schema";
import { TYPE_DEFAULT_DIRECTION } from "../schemas/transaction.schema";
import { ROUTES } from "@/config/constants";
import type { ApiResponse } from "@/types";
import type { Transaction } from "../types";

// ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════

interface ChangeSet {
  [field: string]: {
    from: unknown;
    to: unknown;
  };
}

// ═══════════════════════════════════════════════════════════
// SERVER ACTION
// ═══════════════════════════════════════════════════════════

export async function updateTransaction(
  input: unknown
): Promise<ApiResponse<Transaction>> {
  try {
    // ═══════════════════════════════════════════
    // LAYER 1: VALIDATE
    // ═══════════════════════════════════════════
    const parsed = transactionUpdateSchema.safeParse(input);

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

    const { id, ...data } = parsed.data;

    // ═══════════════════════════════════════════
    // LAYER 2: FETCH EXISTING
    // ═══════════════════════════════════════════
    const existing = await prisma.transaction.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!existing) {
      return {
        success: false,
        error: "Transaction not found or has been deleted",
      };
    }

    // ═══════════════════════════════════════════
    // LAYER 3: VERIFY KARIGAR
    // ═══════════════════════════════════════════
    const karigarId = data.karigarId ?? existing.karigarId;
    const karigar = await prisma.karigar.findFirst({
      where: {
        id: karigarId,
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
        error: "Karigar not found",
        fieldErrors: {
          karigarId: ["Karigar not found"],
        },
      };
    }

    // ═══════════════════════════════════════════
    // LAYER 4: AUTO-DERIVE DIRECTION
    // ═══════════════════════════════════════════
    const newType = data.type ?? existing.type;
    const newDirection =
      data.direction ??
      (data.type ? TYPE_DEFAULT_DIRECTION[newType] : existing.direction);

    // ═══════════════════════════════════════════
    // LAYER 5: BUILD CHANGE SET
    // ═══════════════════════════════════════════
    const changes: ChangeSet = {};

    const fieldsToTrack = [
      "karigarId",
      "type",
      "direction",
      "amount",
      "quantity",
      "rate",
      "paymentMode",
      "reference",
      "description",
      "transactionDate",
    ] as const;

    for (const field of fieldsToTrack) {
      const oldValue = existing[field as keyof typeof existing];
      let newValue: unknown;

      // Special handling for direction (auto-derived)
      if (field === "direction") {
        newValue = newDirection;
      } else if (field === "transactionDate") {
        newValue = data.transactionDate ?? existing.transactionDate;
      } else {
        newValue = data[field as keyof typeof data];
      }

      // Only track if actually changed
      if (newValue !== undefined) {
        const oldNum = oldValue instanceof Date ? oldValue.getTime() : Number(oldValue);
        const newNum = newValue instanceof Date ? newValue.getTime() : Number(newValue);

        // For numbers, compare numerically
        if (typeof oldValue === "object" && typeof newValue === "object") {
          if (oldValue !== null && newValue !== null) {
            const oldStr = JSON.stringify(oldValue);
            const newStr = JSON.stringify(newValue);
            if (oldStr !== newStr) {
              changes[field] = { from: oldValue, to: newValue };
            }
          }
        } else if (oldValue !== newValue) {
          changes[field] = { from: oldValue, to: newValue };
        }
      }
    }

    // ═══════════════════════════════════════════
    // LAYER 6: NO CHANGES? SKIP
    // ═══════════════════════════════════════════
    if (Object.keys(changes).length === 0) {
      return {
        success: true,
        data: {
          id: existing.id,
          karigarId: existing.karigarId,
          type: existing.type,
          direction: existing.direction,
          amount: Number(existing.amount),
          quantity: existing.quantity ? Number(existing.quantity) : null,
          rate: existing.rate ? Number(existing.rate) : null,
          paymentMode: existing.paymentMode,
          reference: existing.reference,
          description: existing.description,
          transactionDate: existing.transactionDate,
          deletedAt: existing.deletedAt,
          createdAt: existing.createdAt,
          updatedAt: existing.updatedAt,
        },
        message: "No changes to update",
      };
    }

    // ═══════════════════════════════════════════
    // LAYER 7: PERFORM UPDATE
    // ═══════════════════════════════════════════
    const updated = await prisma.transaction.update({
      where: { id },
      data: {
        ...(data.karigarId !== undefined && { karigarId: data.karigarId }),
        ...(data.type !== undefined && { type: data.type }),
        direction: newDirection,
        ...(data.amount !== undefined && { amount: data.amount }),
        ...(data.quantity !== undefined && { quantity: data.quantity ?? null }),
        ...(data.rate !== undefined && { rate: data.rate ?? null }),
        ...(data.paymentMode !== undefined && {
          paymentMode: data.paymentMode ?? null,
        }),
        ...(data.reference !== undefined && {
          reference: data.reference ?? null,
        }),
        ...(data.description !== undefined && {
          description: data.description,
        }),
        ...(data.transactionDate !== undefined && {
          transactionDate: data.transactionDate,
        }),
      },
    });

    // ═══════════════════════════════════════════
    // LAYER 8: LOG ACTIVITY
    // ═══════════════════════════════════════════
    await prisma.activityLog.create({
      data: {
        action: "UPDATE",
        entityType: "Transaction",
        entityId: updated.id,
        metadata: {
          karigarId: karigar.id,
          karigarName: karigar.name,
          changes,
        },
      },
    });

    // ═══════════════════════════════════════════
    // LAYER 9: REVALIDATE
    // ═══════════════════════════════════════════
    revalidatePath(ROUTES.TRANSACTIONS);
    revalidatePath(ROUTES.DASHBOARD);
    revalidatePath(ROUTES.KARIGAR_DETAIL(karigar.id));
    revalidatePath(ROUTES.LEDGER_DETAIL(karigar.id));

    // Old karigar path (if changed)
    if (data.karigarId && data.karigarId !== existing.karigarId) {
      revalidatePath(ROUTES.KARIGAR_DETAIL(existing.karigarId));
      revalidatePath(ROUTES.LEDGER_DETAIL(existing.karigarId));
    }

    // ═══════════════════════════════════════════
    // SERIALIZE RESPONSE
    // ═══════════════════════════════════════════
    const serialized: Transaction = {
      id: updated.id,
      karigarId: updated.karigarId,
      type: updated.type,
      direction: updated.direction,
      amount: Number(updated.amount),
      quantity: updated.quantity ? Number(updated.quantity) : null,
      rate: updated.rate ? Number(updated.rate) : null,
      paymentMode: updated.paymentMode,
      reference: updated.reference,
      description: updated.description,
      transactionDate: updated.transactionDate,
      deletedAt: updated.deletedAt,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    };

    return {
      success: true,
      data: serialized,
      message: "Transaction updated successfully",
    };
  } catch (error) {
    console.error("[updateTransaction] Error:", error);

    return {
      success: false,
      error: "Failed to update transaction. Please try again.",
    };
  }
}
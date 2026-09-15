"use server";

/**
 * Delete Transaction — Server Action (Soft Delete)
 * 
 * SOFT DELETE PATTERN:
 * - Never hard-delete from database
 * - Set `deletedAt` timestamp instead
 * - Preserves ledger history
 * - Can be restored (future feature)
 * 
 * BUSINESS RULES:
 * - Transaction must exist and not be deleted
 * - Karigar balance will auto-recalculate (on next fetch)
 * - Logs activity with amount + type context
 * 
 * USAGE:
 *   const result = await deleteTransaction({ id });
 *   if (result.success) { toast.success("Deleted"); }
 */

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { transactionDeleteSchema } from "../schemas/transaction.schema";
import { ROUTES, TRANSACTION_TYPE_LABELS } from "@/config/constants";
import type { ApiResponse } from "@/types";

// ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════

interface DeleteResponse {
  id: string;
  karigarId: string;
  type: string;
  amount: number;
  description: string;
}

// ═══════════════════════════════════════════════════════════
// SERVER ACTION
// ═══════════════════════════════════════════════════════════

export async function deleteTransaction(
  input: unknown
): Promise<ApiResponse<DeleteResponse>> {
  try {
    // ═══════════════════════════════════════════
    // VALIDATE
    // ═══════════════════════════════════════════
    const parsed = transactionDeleteSchema.safeParse(input);

    if (!parsed.success) {
      return {
        success: false,
        error: "Invalid transaction ID",
      };
    }

    const { id } = parsed.data;

    // ═══════════════════════════════════════════
    // FETCH EXISTING
    // ═══════════════════════════════════════════
    const existing = await prisma.transaction.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        karigar: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!existing) {
      return {
        success: false,
        error: "Transaction not found or already deleted",
      };
    }

    // ═══════════════════════════════════════════
    // SOFT DELETE
    // ═══════════════════════════════════════════
    const now = new Date();

    await prisma.transaction.update({
      where: { id },
      data: {
        deletedAt: now,
      },
    });

    // ═══════════════════════════════════════════
    // LOG ACTIVITY
    // ═══════════════════════════════════════════
    await prisma.activityLog.create({
      data: {
        action: "DELETE",
        entityType: "Transaction",
        entityId: id,
        metadata: {
          karigarId: existing.karigar.id,
          karigarName: existing.karigar.name,
          type: existing.type,
          typeLabel: TRANSACTION_TYPE_LABELS[existing.type],
          direction: existing.direction,
          amount: Number(existing.amount),
          description: existing.description,
          softDelete: true,
        },
      },
    });

    // ═══════════════════════════════════════════
    // REVALIDATE
    // ═══════════════════════════════════════════
    revalidatePath(ROUTES.TRANSACTIONS);
    revalidatePath(ROUTES.DASHBOARD);
    revalidatePath(ROUTES.KARIGAR_DETAIL(existing.karigar.id));
    revalidatePath(ROUTES.LEDGER_DETAIL(existing.karigar.id));

    // ═══════════════════════════════════════════
    // RESPONSE
    // ═══════════════════════════════════════════
    return {
      success: true,
      data: {
        id: existing.id,
        karigarId: existing.karigar.id,
        type: existing.type,
        amount: Number(existing.amount),
        description: existing.description,
      },
      message: "Transaction deleted successfully",
    };
  } catch (error) {
    console.error("[deleteTransaction] Error:", error);

    return {
      success: false,
      error: "Failed to delete transaction. Please try again.",
    };
  }
}

// ═══════════════════════════════════════════════════════════
// RESTORE (Future — Uncomment when needed)
// ═══════════════════════════════════════════════════════════

/**
 * Restores a soft-deleted transaction.
 * 
 * USAGE:
 *   await restoreTransaction({ id });
 */
// export async function restoreTransaction(
//   input: unknown
// ): Promise<ApiResponse<{ id: string }>> {
//   try {
//     const parsed = transactionDeleteSchema.safeParse(input);
//     if (!parsed.success) {
//       return { success: false, error: "Invalid transaction ID" };
//     }
// 
//     const { id } = parsed.data;
// 
//     const existing = await prisma.transaction.findFirst({
//       where: { id, deletedAt: { not: null } },
//     });
// 
//     if (!existing) {
//       return { success: false, error: "Transaction not found or not deleted" };
//     }
// 
//     await prisma.transaction.update({
//       where: { id },
//       data: { deletedAt: null },
//     });
// 
//     await prisma.activityLog.create({
//       data: {
//         action: "UPDATE",
//         entityType: "Transaction",
//         entityId: id,
//         metadata: { action: "restore" },
//       },
//     });
// 
//     revalidatePath(ROUTES.TRANSACTIONS);
//     revalidatePath(ROUTES.DASHBOARD);
//     revalidatePath(ROUTES.KARIGAR_DETAIL(existing.karigarId));
//     revalidatePath(ROUTES.LEDGER_DETAIL(existing.karigarId));
// 
//     return {
//       success: true,
//       data: { id },
//       message: "Transaction restored successfully",
//     };
//   } catch (error) {
//     console.error("[restoreTransaction] Error:", error);
//     return { success: false, error: "Failed to restore transaction" };
//   }
// }
"use server";

/**
 * Delete Karigar — Soft Delete
 * 
 * SOFT DELETE PATTERN:
 * - Never hard-delete from database
 * - Set `deletedAt` timestamp instead
 * - Preserves transactions history
 * - Can be restored (future feature)
 * 
 * BUSINESS RULES:
 * - Karigar with transactions → Can still delete (keeps history)
 * - Karigar already deleted → Error
 * - Karigar not found → Error
 * 
 * USAGE:
 *   const result = await deleteKarigar({ id });
 *   if (result.success) { toast.success("Deleted"); }
 */

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { karigarDeleteSchema } from "../schemas/karigar.schema";
import { ROUTES } from "@/config/constants";
import type { ApiResponse } from "@/types";

// ═══════════════════════════════════════════════════════════
// SERVER ACTION
// ═══════════════════════════════════════════════════════════

export async function deleteKarigar(
  input: unknown
): Promise<ApiResponse<{ id: string; name: string }>> {
  try {
    // ═══════════════════════════════════════════
    // VALIDATE INPUT
    // ═══════════════════════════════════════════
    const parsed = karigarDeleteSchema.safeParse(input);

    if (!parsed.success) {
      return {
        success: false,
        error: "Invalid karigar ID",
      };
    }

    const { id } = parsed.data;

    // ═══════════════════════════════════════════
    // CHECK EXISTS (Not already deleted)
    // ═══════════════════════════════════════════
    const existing = await prisma.karigar.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            transactions: {
              where: { deletedAt: null },
            },
          },
        },
      },
    });

    if (!existing) {
      return {
        success: false,
        error: "Karigar not found or already deleted",
      };
    }

    // ═══════════════════════════════════════════
    // SOFT DELETE
    // ═══════════════════════════════════════════
    const now = new Date();

    await prisma.karigar.update({
      where: { id },
      data: {
        deletedAt: now,
        isActive: false,
      },
    });

    // ═══════════════════════════════════════════
    // LOG ACTIVITY
    // ═══════════════════════════════════════════
    await prisma.activityLog.create({
      data: {
        action: "DELETE",
        entityType: "Karigar",
        entityId: id,
        metadata: {
          name: existing.name,
          transactionCount: existing._count.transactions,
          softDelete: true,
        },
      },
    });

    // ═══════════════════════════════════════════
    // REVALIDATE
    // ═══════════════════════════════════════════
    revalidatePath(ROUTES.KARIGAR);
    revalidatePath(ROUTES.DASHBOARD);

    return {
      success: true,
      data: {
        id: existing.id,
        name: existing.name,
      },
      message: `"${existing.name}" deleted successfully`,
    };
  } catch (error) {
    console.error("[deleteKarigar] Error:", error);

    return {
      success: false,
      error: "Failed to delete karigar. Please try again.",
    };
  }
}

// ═══════════════════════════════════════════════════════════
// RESTORE (Future — Uncomment when needed)
// ═══════════════════════════════════════════════════════════

/**
 * Restores a soft-deleted karigar.
 * 
 * USAGE:
 *   await restoreKarigar({ id });
 */
// export async function restoreKarigar(
//   input: unknown
// ): Promise<ApiResponse<{ id: string; name: string }>> {
//   try {
//     const parsed = karigarDeleteSchema.safeParse(input);
//     if (!parsed.success) {
//       return { success: false, error: "Invalid karigar ID" };
//     }
// 
//     const { id } = parsed.data;
// 
//     const existing = await prisma.karigar.findFirst({
//       where: { id, deletedAt: { not: null } },
//     });
// 
//     if (!existing) {
//       return { success: false, error: "Karigar not found or not deleted" };
//     }
// 
//     const restored = await prisma.karigar.update({
//       where: { id },
//       data: { deletedAt: null, isActive: true },
//     });
// 
//     await prisma.activityLog.create({
//       data: {
//         action: "UPDATE",
//         entityType: "Karigar",
//         entityId: id,
//         metadata: { name: restored.name, action: "restore" },
//       },
//     });
// 
//     revalidatePath(ROUTES.KARIGAR);
//     revalidatePath(ROUTES.DASHBOARD);
// 
//     return {
//       success: true,
//       data: { id: restored.id, name: restored.name },
//       message: `"${restored.name}" restored successfully`,
//     };
//   } catch (error) {
//     console.error("[restoreKarigar] Error:", error);
//     return { success: false, error: "Failed to restore karigar" };
//   }
// }
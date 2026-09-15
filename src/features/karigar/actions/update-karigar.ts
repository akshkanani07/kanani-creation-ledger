"use server";

/**
 * Update Karigar — Server Action
 * 
 * Updates an existing karigar record.
 * 
 * DIFFERENCE FROM CREATE:
 * - Requires `id`
 * - Duplicate phone check excludes self
 * - Logs WHAT changed (old vs new)
 * - Does NOT allow phone change if it breaks unique constraint
 * 
 * USAGE:
 *   const result = await updateKarigar({ id, ...data });
 *   if (result.success) { redirect("/karigar"); }
 */

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { karigarUpdateSchema } from "../schemas/karigar.schema";
import { ROUTES } from "@/config/constants";
import type { ApiResponse } from "@/types";
import type { Karigar } from "../types";

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

export async function updateKarigar(
  input: unknown
): Promise<ApiResponse<Karigar>> {
  try {
    // ═══════════════════════════════════════════
    // VALIDATE INPUT
    // ═══════════════════════════════════════════
    const parsed = karigarUpdateSchema.safeParse(input);

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
    // CHECK KARIGAR EXISTS
    // ═══════════════════════════════════════════
    const existing = await prisma.karigar.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!existing) {
      return {
        success: false,
        error: "Karigar not found",
      };
    }

    // ═══════════════════════════════════════════
    // CHECK DUPLICATE PHONE (EXCLUDE SELF)
    // ═══════════════════════════════════════════
    if (data.phone && data.phone !== existing.phone) {
      const duplicate = await prisma.karigar.findFirst({
        where: {
          phone: data.phone,
          deletedAt: null,
          id: { not: id }, // ← Exclude current karigar
        },
        select: { id: true, name: true },
      });

      if (duplicate) {
        return {
          success: false,
          error: `Phone number already registered to "${duplicate.name}"`,
          fieldErrors: {
            phone: ["This phone number is already in use"],
          },
        };
      }
    }

    // ═══════════════════════════════════════════
    // BUILD CHANGE SET (for audit log)
    // ═══════════════════════════════════════════
    const changes: ChangeSet = {};

    const fieldsToTrack: Array<keyof typeof data> = [
      "name",
      "phone",
      "address",
      "photoUrl",
      "photoId",
      "isActive",
    ];

    for (const field of fieldsToTrack) {
      const oldValue = existing[field];
      const newValue = data[field];

      // Only track if changed
      if (newValue !== undefined && newValue !== oldValue) {
        changes[field] = {
          from: oldValue,
          to: newValue,
        };
      }
    }

    // ═══════════════════════════════════════════
    // NO CHANGES? SKIP UPDATE
    // ═══════════════════════════════════════════
    if (Object.keys(changes).length === 0) {
      return {
        success: true,
        data: existing,
        message: "No changes to update",
      };
    }

    // ═══════════════════════════════════════════
    // PERFORM UPDATE
    // ═══════════════════════════════════════════
    const updated = await prisma.karigar.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.phone !== undefined && { phone: data.phone }),
        ...(data.address !== undefined && { address: data.address ?? null }),
        ...(data.photoUrl !== undefined && { photoUrl: data.photoUrl ?? null }),
        ...(data.photoId !== undefined && { photoId: data.photoId ?? null }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    });

    // ═══════════════════════════════════════════
    // LOG ACTIVITY
    // ═══════════════════════════════════════════
    await prisma.activityLog.create({
      data: {
        action: "UPDATE",
        entityType: "Karigar",
        entityId: id,
        metadata: {
          name: updated.name,
          changes,
        },
      },
    });

    // ═══════════════════════════════════════════
    // REVALIDATE
    // ═══════════════════════════════════════════
    revalidatePath(ROUTES.KARIGAR);
    revalidatePath(`/karigar/${id}`);
    revalidatePath(ROUTES.DASHBOARD);

    return {
      success: true,
      data: updated,
      message: "Karigar updated successfully",
    };
  } catch (error) {
    console.error("[updateKarigar] Error:", error);

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
      error: "Failed to update karigar. Please try again.",
    };
  }
}
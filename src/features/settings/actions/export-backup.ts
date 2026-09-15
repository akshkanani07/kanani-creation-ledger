"use server";

/**
 * Export Backup — Server Action
 * 
 * Exports ALL data as JSON:
 * - Owner info
 * - All Karigars
 * - All Transactions
 * - All Activity Logs
 * 
 * USAGE:
 *   const result = await exportBackup();
 *   if (result.success) {
 *     // Download JSON file
 *   }
 */

import { prisma } from "@/lib/prisma";
import { siteConfig } from "@/config/site";
import type { ApiResponse } from "@/types";
import type { BackupData } from "../types";

// ═══════════════════════════════════════════════════════════
// SERVER ACTION
// ═══════════════════════════════════════════════════════════

export async function exportBackup(): Promise<ApiResponse<BackupData>> {
  try {
    // ═══════════════════════════════════════════
    // FETCH ALL DATA (PARALLEL)
    // ═══════════════════════════════════════════
    const [owner, karigars, transactions, activityLogs] = await Promise.all([
      prisma.user.findFirst({
        select: { email: true, name: true },
      }),

      prisma.karigar.findMany({
        where: { deletedAt: null },
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          name: true,
          phone: true,
          address: true,
          photoUrl: true,
          isActive: true,
          createdAt: true,
        },
      }),

      prisma.transaction.findMany({
        where: { deletedAt: null },
        orderBy: { transactionDate: "asc" },
        select: {
          id: true,
          karigarId: true,
          type: true,
          direction: true,
          amount: true,
          quantity: true,
          rate: true,
          paymentMode: true,
          reference: true,
          description: true,
          transactionDate: true,
          createdAt: true,
        },
      }),

      prisma.activityLog.findMany({
        orderBy: { createdAt: "desc" },
        take: 1000,
        select: {
          id: true,
          action: true,
          entityType: true,
          entityId: true,
          metadata: true,
          createdAt: true,
        },
      }),
    ]);

    // ═══════════════════════════════════════════
    // BUILD BACKUP DATA
    // ═══════════════════════════════════════════
    const backup: BackupData = {
      metadata: {
        generatedAt: new Date().toISOString(),
        version: siteConfig.version,
        company: siteConfig.company.name,
        industry: siteConfig.company.industry,
      },

      owner: owner
        ? {
            email: owner.email,
            name: owner.name,
          }
        : {
            email: "unknown",
            name: "Owner",
          },

      karigars: karigars.map((k) => ({
        id: k.id,
        name: k.name,
        phone: k.phone,
        address: k.address,
        photoUrl: k.photoUrl,
        isActive: k.isActive,
        createdAt: k.createdAt.toISOString(),
      })),

      transactions: transactions.map((t) => ({
        id: t.id,
        karigarId: t.karigarId,
        type: t.type,
        direction: t.direction,
        amount: Number(t.amount),
        quantity: t.quantity ? Number(t.quantity) : null,
        rate: t.rate ? Number(t.rate) : null,
        paymentMode: t.paymentMode,
        reference: t.reference,
        description: t.description,
        transactionDate: t.transactionDate.toISOString(),
        createdAt: t.createdAt.toISOString(),
      })),

      activityLogs: activityLogs.map((log) => ({
        id: log.id,
        action: log.action,
        entityType: log.entityType,
        entityId: log.entityId,
        metadata: log.metadata,
        createdAt: log.createdAt.toISOString(),
      })),

      stats: {
        totalKarigars: karigars.length,
        totalTransactions: transactions.length,
        totalActivityLogs: activityLogs.length,
      },
    };

    return {
      success: true,
      data: backup,
      message: "Backup generated successfully",
    };
  } catch (error) {
    console.error("[exportBackup] Error:", error);

    return {
      success: false,
      error: "Failed to generate backup",
    };
  }
}
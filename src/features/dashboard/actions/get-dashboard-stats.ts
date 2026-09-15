"use server";

/**
 * Get Dashboard Stats — Server Action
 * 
 * Fetches key metrics for the dashboard:
 * - Total Karigars (all time)
 * - Active Karigars (not deleted, isActive)
 * - Total Pending Balance (sum across all karigars)
 * - Today's Work (sum of WORK transactions today)
 * - Today's Transaction Count
 * - This Month's Work Value
 * 
 * PERFORMANCE:
 * - Uses Promise.all() for parallel queries
 * - Aggregates via Prisma (DB-level, not JS)
 * - Excludes soft-deleted records
 * 
 * WHY SERVER ACTION:
 * - Type-safe return (ApiResponse)
 * - Direct Prisma access
 * - No API route needed
 * - Auto caching by Next.js (revalidates on mutation)
 */

import { prisma } from "@/lib/prisma";
import type { ApiResponse } from "@/types";

// ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════

export interface DashboardStats {
  totalKarigars: number;
  activeKarigars: number;
  totalPending: number;
  todayWork: number;
  todayTransactions: number;
  monthWork: number;
}

// ═══════════════════════════════════════════════════════════
// HELPER — Date Range
// ═══════════════════════════════════════════════════════════

function getStartOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function getStartOfMonth(): Date {
  const d = new Date();
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}

// ═══════════════════════════════════════════════════════════
// SERVER ACTION
// ═══════════════════════════════════════════════════════════

export async function getDashboardStats(): Promise<
  ApiResponse<DashboardStats>
> {
  try {
    const startOfToday = getStartOfToday();
    const startOfMonth = getStartOfMonth();

    // ═══════════════════════════════════════════
    // PARALLEL QUERIES (Promise.all)
    // ═══════════════════════════════════════════
    const [
      totalKarigars,
      activeKarigars,
      pendingBalanceResult,
      todayWorkResult,
      todayTransactions,
      monthWorkResult,
    ] = await Promise.all([
      // 1. Total karigars (including soft-deleted for history)
      prisma.karigar.count({
        where: { deletedAt: null },
      }),

      // 2. Active karigars only
      prisma.karigar.count({
        where: {
          deletedAt: null,
          isActive: true,
        },
      }),

      // 3. Total pending balance (all CREDIT - all DEBIT)
      prisma.transaction.groupBy({
        by: ["direction"],
        where: { deletedAt: null },
        _sum: { amount: true },
      }),

      // 4. Today's work (WORK type transactions today)
      prisma.transaction.aggregate({
        where: {
          deletedAt: null,
          type: "WORK",
          transactionDate: { gte: startOfToday },
        },
        _sum: { amount: true },
      }),

      // 5. Today's transaction count
      prisma.transaction.count({
        where: {
          deletedAt: null,
          transactionDate: { gte: startOfToday },
        },
      }),

      // 6. This month's work value
      prisma.transaction.aggregate({
        where: {
          deletedAt: null,
          type: "WORK",
          transactionDate: { gte: startOfMonth },
        },
        _sum: { amount: true },
      }),
    ]);

    // ═══════════════════════════════════════════
    // CALCULATE PENDING BALANCE
    // ═══════════════════════════════════════════
    const creditSum = Number(
      pendingBalanceResult.find((r) => r.direction === "CREDIT")?._sum.amount ??
        0
    );
    const debitSum = Number(
      pendingBalanceResult.find((r) => r.direction === "DEBIT")?._sum.amount ??
        0
    );
    const totalPending = creditSum - debitSum;

    // ═══════════════════════════════════════════
    // BUILD RESPONSE
    // ═══════════════════════════════════════════
    const stats: DashboardStats = {
      totalKarigars,
      activeKarigars,
      totalPending: Math.max(0, totalPending), // Negative = company owes more, treat as 0
      todayWork: Number(todayWorkResult._sum.amount ?? 0),
      todayTransactions,
      monthWork: Number(monthWorkResult._sum.amount ?? 0),
    };

    return {
      success: true,
      data: stats,
    };
  } catch (error) {
    console.error("[getDashboardStats] Error:", error);

    return {
      success: false,
      error: "Failed to load dashboard stats",
    };
  }
}
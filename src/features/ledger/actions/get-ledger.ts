"use server";

/**
 * Get Ledger — Server Action
 * 
 * Fetches complete ledger for a karigar with:
 * - Date range filter
 * - Running balance calculation
 * - Summary (opening, credit, debit, closing)
 * 
 * CRITICAL: Transactions must be sorted ASC for correct running balance.
 * 
 * USAGE:
 *   const result = await getLedger({
 *     karigarId: "abc123",
 *     dateFrom: new Date("2026-04-01"),
 *     dateTo: new Date("2026-09-30"),
 *   });
 */

import { prisma } from "@/lib/prisma";
import type { ApiResponse } from "@/types";
import {
  calculateRunningBalance,
  calculateLedgerSummary,
} from "../utils/calculate-balance";
import type { LedgerResult, LedgerFilters } from "../types";

// ═══════════════════════════════════════════════════════════
// SERVER ACTION
// ═══════════════════════════════════════════════════════════

export async function getLedger(
  filters: LedgerFilters
): Promise<ApiResponse<LedgerResult>> {
  try {
    const { karigarId, dateFrom, dateTo, type } = filters;

    // ═══════════════════════════════════════════
    // 1. FETCH KARIGAR
    // ═══════════════════════════════════════════
    const karigar = await prisma.karigar.findFirst({
      where: {
        id: karigarId,
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        phone: true,
        photoUrl: true,
        address: true,
      },
    });

    if (!karigar) {
      return {
        success: false,
        error: "Karigar not found",
      };
    }

    // ═══════════════════════════════════════════
    // 2. CALCULATE OPENING BALANCE
    //    (Sum of all transactions BEFORE dateFrom)
    // ═══════════════════════════════════════════
    let openingBalance = 0;

    if (dateFrom) {
      const priorTransactions = await prisma.transaction.findMany({
        where: {
          karigarId,
          deletedAt: null,
          transactionDate: { lt: dateFrom },
        },
        select: {
          amount: true,
          direction: true,
        },
      });

      openingBalance = priorTransactions.reduce((balance, tx) => {
        const amount = Number(tx.amount);
        return tx.direction === "CREDIT"
          ? balance + amount
          : balance - amount;
      }, 0);
    }

    // ═══════════════════════════════════════════
    // 3. FETCH TRANSACTIONS IN RANGE
    //    ⚠️ SORTED ASC (oldest first) for running balance
    // ═══════════════════════════════════════════
    const whereClause: {
      karigarId: string;
      deletedAt: null;
      transactionDate?: { gte?: Date; lte?: Date };
      type?: typeof type;
    } = {
      karigarId,
      deletedAt: null,
    };

    if (dateFrom || dateTo) {
      whereClause.transactionDate = {};
      if (dateFrom) whereClause.transactionDate.gte = dateFrom;
      if (dateTo) whereClause.transactionDate.lte = dateTo;
    }

    if (type) {
      whereClause.type = type;
    }

    const transactions = await prisma.transaction.findMany({
      where: whereClause,
      orderBy: {
        transactionDate: "asc", // ⚠️ ASC for running balance
      },
    });

    // ═══════════════════════════════════════════
    // 4. CALCULATE RUNNING BALANCE
    // ═══════════════════════════════════════════
    const entries = calculateRunningBalance(transactions, openingBalance);

    // ═══════════════════════════════════════════
    // 5. CALCULATE SUMMARY
    // ═══════════════════════════════════════════
    const summary = calculateLedgerSummary(entries, openingBalance);

    // ═══════════════════════════════════════════
    // 6. RETURN RESULT
    // ═══════════════════════════════════════════
    return {
      success: true,
      data: {
        karigar,
        entries,
        summary,
        dateRange: {
          from: dateFrom ?? null,
          to: dateTo ?? null,
        },
      },
    };
  } catch (error) {
    console.error("[getLedger] Error:", error);

    return {
      success: false,
      error: "Failed to load ledger. Please try again.",
    };
  }
}
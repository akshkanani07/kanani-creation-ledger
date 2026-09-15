"use server";

/**
 * Get Report Data — Server Action
 * 
 * Fetches report data based on scope:
 * - karigar: Single karigar with transactions + running balance
 * - all-karigars: Summary of all karigars
 * - by-type: Type distribution + transactions
 * 
 * USAGE:
 *   const result = await getReportData({
 *     scope: "karigar",
 *     karigarId: "abc123",
 *     dateFrom: new Date("2026-04-01"),
 *     dateTo: new Date("2026-09-30"),
 *   });
 */

import { prisma } from "@/lib/prisma";
import { siteConfig } from "@/config/site";
import { calculateRunningBalance } from "@/features/ledger/utils/calculate-balance";
import type { ApiResponse } from "@/types";
import type {
  ReportData,
  ReportFilters,
  ReportMetadata,
  ReportTransaction,
  KarigarSummary,
  TypeDistributionItem,
} from "../types";

// ═══════════════════════════════════════════════════════════
// SERVER ACTION
// ═══════════════════════════════════════════════════════════

export async function getReportData(
  filters: ReportFilters
): Promise<ApiResponse<ReportData>> {
  try {
    const metadata = buildMetadata(filters);

    // ═══════════════════════════════════════════
    // ROUTE BY SCOPE
    // ═══════════════════════════════════════════
    switch (filters.scope) {
      case "karigar":
        return await getKarigarReport(filters, metadata);

      case "all-karigars":
        return await getAllKarigarsReport(filters, metadata);

      case "by-type":
        return await getByTypeReport(filters, metadata);

      default:
        return {
          success: false,
          error: "Invalid report scope",
        };
    }
  } catch (error) {
    console.error("[getReportData] Error:", error);

    return {
      success: false,
      error: "Failed to load report data",
    };
  }
}

// ═══════════════════════════════════════════════════════════
// SCOPE 1: KARIGAR REPORT
// ═══════════════════════════════════════════════════════════

async function getKarigarReport(
  filters: ReportFilters,
  metadata: ReportMetadata
): Promise<ApiResponse<ReportData>> {
  if (!filters.karigarId) {
    return {
      success: false,
      error: "Karigar ID is required for karigar report",
    };
  }

  // ═══════════════════════════════════════════
  // FETCH KARIGAR
  // ═══════════════════════════════════════════
  const karigar = await prisma.karigar.findFirst({
    where: {
      id: filters.karigarId,
      deletedAt: null,
    },
    select: {
      id: true,
      name: true,
      phone: true,
      address: true,
      photoUrl: true,
    },
  });

  if (!karigar) {
    return {
      success: false,
      error: "Karigar not found",
    };
  }

  // ═══════════════════════════════════════════
  // OPENING BALANCE (Before dateFrom)
  // ═══════════════════════════════════════════
  let openingBalance = 0;

  if (filters.dateFrom) {
    const priorTransactions = await prisma.transaction.findMany({
      where: {
        karigarId: filters.karigarId,
        deletedAt: null,
        transactionDate: { lt: filters.dateFrom },
      },
      select: { amount: true, direction: true },
    });

    openingBalance = priorTransactions.reduce((balance, tx) => {
      const amount = Number(tx.amount);
      return tx.direction === "CREDIT"
        ? balance + amount
        : balance - amount;
    }, 0);
  }

  // ═══════════════════════════════════════════
  // FETCH TRANSACTIONS (ASC for balance)
  // ═══════════════════════════════════════════
  const whereClause: {
    karigarId: string;
    deletedAt: null;
    transactionDate?: { gte?: Date; lte?: Date };
    type?: typeof filters.type;
  } = {
    karigarId: filters.karigarId,
    deletedAt: null,
  };

  if (filters.dateFrom || filters.dateTo) {
    whereClause.transactionDate = {};
    if (filters.dateFrom) whereClause.transactionDate.gte = filters.dateFrom;
    if (filters.dateTo) whereClause.transactionDate.lte = filters.dateTo;
  }

  if (filters.type) {
    whereClause.type = filters.type;
  }

  const rawTransactions = await prisma.transaction.findMany({
    where: whereClause,
    orderBy: { transactionDate: "asc" },
  });

  // ═══════════════════════════════════════════
  // CALCULATE RUNNING BALANCE
  // ═══════════════════════════════════════════
  const entries = calculateRunningBalance(rawTransactions, openingBalance);

  const transactions: ReportTransaction[] = entries.map((entry) => ({
    id: entry.id,
    date: entry.date,
    type: entry.type,
    direction: entry.direction,
    amount: entry.amount,
    quantity: entry.quantity,
    rate: entry.rate,
    paymentMode: entry.paymentMode,
    reference: entry.reference,
    description: entry.description,
    runningBalance: entry.runningBalance,
  }));

  // ═══════════════════════════════════════════
  // CALCULATE SUMMARY
  // ═══════════════════════════════════════════
  const totalCredit = transactions
    .filter((t) => t.direction === "CREDIT")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalDebit = transactions
    .filter((t) => t.direction === "DEBIT")
    .reduce((sum, t) => sum + t.amount, 0);

  const closingBalance =
    transactions.length > 0
      ? transactions[transactions.length - 1].runningBalance
      : openingBalance;

  const karigarSummary: KarigarSummary = {
    id: karigar.id,
    name: karigar.name,
    phone: karigar.phone,
    address: karigar.address,
    photoUrl: karigar.photoUrl,
    openingBalance,
    totalCredit,
    totalDebit,
    closingBalance,
    transactionCount: transactions.length,
  };

  return {
    success: true,
    data: {
      scope: "karigar",
      metadata,
      karigar: karigarSummary,
      transactions,
    },
  };
}

// ═══════════════════════════════════════════════════════════
// SCOPE 2: ALL KARIGARS REPORT
// ═══════════════════════════════════════════════════════════

async function getAllKarigarsReport(
  filters: ReportFilters,
  metadata: ReportMetadata
): Promise<ApiResponse<ReportData>> {
  const karigars = await prisma.karigar.findMany({
    where: { deletedAt: null },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      phone: true,
      address: true,
      photoUrl: true,
      transactions: {
        where: {
          deletedAt: null,
          ...(filters.dateFrom || filters.dateTo
            ? {
                transactionDate: {
                  ...(filters.dateFrom && { gte: filters.dateFrom }),
                  ...(filters.dateTo && { lte: filters.dateTo }),
                },
              }
            : {}),
        },
        select: {
          amount: true,
          direction: true,
        },
      },
    },
  });

  // ═══════════════════════════════════════════
  // BUILD SUMMARIES
  // ═══════════════════════════════════════════
  const summaries: KarigarSummary[] = karigars.map((k) => {
    const totalCredit = k.transactions
      .filter((t) => t.direction === "CREDIT")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalDebit = k.transactions
      .filter((t) => t.direction === "DEBIT")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    return {
      id: k.id,
      name: k.name,
      phone: k.phone,
      address: k.address,
      photoUrl: k.photoUrl,
      openingBalance: 0,
      totalCredit,
      totalDebit,
      closingBalance: totalCredit - totalDebit,
      transactionCount: k.transactions.length,
    };
  });

  // ═══════════════════════════════════════════
  // TOTALS
  // ═══════════════════════════════════════════
  const totals = {
    totalKarigars: summaries.length,
    totalCredit: summaries.reduce((sum, s) => sum + s.totalCredit, 0),
    totalDebit: summaries.reduce((sum, s) => sum + s.totalDebit, 0),
    totalClosing: summaries.reduce((sum, s) => sum + s.closingBalance, 0),
  };

  return {
    success: true,
    data: {
      scope: "all-karigars",
      metadata,
      karigars: summaries,
      totals,
    },
  };
}

// ═══════════════════════════════════════════════════════════
// SCOPE 3: BY-TYPE REPORT
// ═══════════════════════════════════════════════════════════

async function getByTypeReport(
  filters: ReportFilters,
  metadata: ReportMetadata
): Promise<ApiResponse<ReportData>> {
  const whereClause: {
    deletedAt: null;
    transactionDate?: { gte?: Date; lte?: Date };
    type?: typeof filters.type;
  } = {
    deletedAt: null,
  };

  if (filters.dateFrom || filters.dateTo) {
    whereClause.transactionDate = {};
    if (filters.dateFrom) whereClause.transactionDate.gte = filters.dateFrom;
    if (filters.dateTo) whereClause.transactionDate.lte = filters.dateTo;
  }

  if (filters.type) {
    whereClause.type = filters.type;
  }

  // ═══════════════════════════════════════════
  // GROUP BY TYPE
  // ═══════════════════════════════════════════
  const grouped = await prisma.transaction.groupBy({
    by: ["type"],
    where: whereClause,
    _count: { _all: true },
    _sum: { amount: true },
  });

  const distribution: TypeDistributionItem[] = grouped.map((g) => ({
    type: g.type,
    count: g._count._all,
    totalAmount: Number(g._sum.amount ?? 0),
  }));

  // ═══════════════════════════════════════════
  // FETCH TRANSACTIONS
  // ═══════════════════════════════════════════
  const rawTransactions = await prisma.transaction.findMany({
    where: whereClause,
    orderBy: { transactionDate: "desc" },
    take: 100, // Limit for performance
    include: {
      karigar: {
        select: { id: true, name: true },
      },
    },
  });

  const transactions: ReportTransaction[] = rawTransactions.map((tx) => ({
    id: tx.id,
    date: tx.transactionDate,
    type: tx.type,
    direction: tx.direction,
    amount: Number(tx.amount),
    quantity: tx.quantity ? Number(tx.quantity) : null,
    rate: tx.rate ? Number(tx.rate) : null,
    paymentMode: tx.paymentMode,
    reference: tx.reference,
    description: tx.description,
    runningBalance: 0, // Not applicable for by-type
  }));

  return {
    success: true,
    data: {
      scope: "by-type",
      metadata,
      distribution,
      transactions,
    },
  };
}

// ═══════════════════════════════════════════════════════════
// METADATA BUILDER
// ═══════════════════════════════════════════════════════════

function buildMetadata(filters: ReportFilters): ReportMetadata {
  const from = filters.dateFrom ?? null;
  const to = filters.dateTo ?? null;

  return {
    generatedAt: new Date(),
    period: {
      from,
      to,
      label: buildPeriodLabel(from, to),
    },
    companyName: siteConfig.company.name,
    companyIndustry: siteConfig.company.industry,
  };
}

function buildPeriodLabel(from: Date | null, to: Date | null): string {
  if (!from && !to) return "All Time";

  const formatDate = (d: Date) =>
    d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  if (from && to) return `${formatDate(from)} - ${formatDate(to)}`;
  if (from) return `From ${formatDate(from)}`;
  return `Until ${formatDate(to!)}`;
}
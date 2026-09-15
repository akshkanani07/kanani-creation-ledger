"use server";

/**
 * Get Transactions — Server Action
 * 
 * Fetches transactions with filters, sorting, and pagination.
 * Includes karigar info for each transaction.
 * 
 * FEATURES:
 * - Filter by karigar, type, direction, date range
 * - Search in description/reference
 * - Sort by date, amount, createdAt
 * - Pagination
 * - Includes karigar (name, phone, photo)
 * 
 * USAGE:
 *   const result = await getTransactions({ karigarId: "abc", page: 1 });
 *   if (result.success) { console.log(result.data.items); }
 */

import { prisma } from "@/lib/prisma";
import type { ApiResponse, PaginatedResponse } from "@/types";
import type { TransactionWithKarigar, TransactionFilters } from "../types";

// ═══════════════════════════════════════════════════════════
// SERVER ACTION
// ═══════════════════════════════════════════════════════════

export async function getTransactions(
  filters: TransactionFilters = {}
): Promise<ApiResponse<PaginatedResponse<TransactionWithKarigar>>> {
  try {
    // ═══════════════════════════════════════════
    // PARSE FILTERS
    // ═══════════════════════════════════════════
    const {
      karigarId,
      type,
      direction,
      search,
      dateFrom,
      dateTo,
      page = 1,
      limit = 20,
      sortBy = "date",
      sortOrder = "desc",
    } = filters;

    // ═══════════════════════════════════════════
    // BUILD WHERE CLAUSE
    // ═══════════════════════════════════════════
    const where: {
      deletedAt: null;
      karigarId?: string;
      type?: typeof type;
      direction?: typeof direction;
      transactionDate?: { gte?: Date; lte?: Date };
      OR?: Array<
        | { description: { contains: string; mode: "insensitive" } }
        | { reference: { contains: string; mode: "insensitive" } }
      >;
    } = {
      deletedAt: null,
    };

    if (karigarId) {
      where.karigarId = karigarId;
    }

    if (type) {
      where.type = type;
    }

    if (direction) {
      where.direction = direction;
    }

    // Date Range
    if (dateFrom || dateTo) {
      where.transactionDate = {};
      if (dateFrom) where.transactionDate.gte = dateFrom;
      if (dateTo) where.transactionDate.lte = dateTo;
    }

    // Search
    if (search && search.trim().length > 0) {
      const q = search.trim();
      where.OR = [
        { description: { contains: q, mode: "insensitive" } },
        { reference: { contains: q, mode: "insensitive" } },
      ];
    }

    // ═══════════════════════════════════════════
    // BUILD ORDER BY
    // ═══════════════════════════════════════════
    const orderBy = (() => {
      if (sortBy === "amount") return { amount: sortOrder };
      if (sortBy === "createdAt") return { createdAt: sortOrder };
      // Default: date
      return { transactionDate: sortOrder };
    })();

    // ═══════════════════════════════════════════
    // PAGINATION
    // ═══════════════════════════════════════════
    const skip = (page - 1) * limit;

    // ═══════════════════════════════════════════
    // PARALLEL QUERIES
    // ═══════════════════════════════════════════
    const [total, transactions] = await Promise.all([
      prisma.transaction.count({ where }),

      prisma.transaction.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          karigar: {
            select: {
              id: true,
              name: true,
              phone: true,
              photoUrl: true,
            },
          },
        },
      }),
    ]);

    // ═══════════════════════════════════════════
    // SERIALIZE (Convert Decimal to Number)
    // ═══════════════════════════════════════════
    const items: TransactionWithKarigar[] = transactions.map((tx) => ({
      id: tx.id,
      karigarId: tx.karigarId,
      type: tx.type,
      direction: tx.direction,
      amount: Number(tx.amount),
      quantity: tx.quantity ? Number(tx.quantity) : null,
      rate: tx.rate ? Number(tx.rate) : null,
      paymentMode: tx.paymentMode,
      reference: tx.reference,
      description: tx.description,
      transactionDate: tx.transactionDate,
      deletedAt: tx.deletedAt,
      createdAt: tx.createdAt,
      updatedAt: tx.updatedAt,
      karigar: tx.karigar,
    }));

    // ═══════════════════════════════════════════
    // PAGINATION METADATA
    // ═══════════════════════════════════════════
    const totalPages = Math.ceil(total / limit);

    return {
      success: true,
      data: {
        items,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      },
    };
  } catch (error) {
    console.error("[getTransactions] Error:", error);

    return {
      success: false,
      error: "Failed to load transactions",
    };
  }
}
"use server";

/**
 * Get Karigars — Server Action
 * 
 * Fetches karigars with computed balance from transactions.
 * 
 * FEATURES:
 * - Search (name, phone)
 * - Filter (active/inactive)
 * - Sort (name, balance, createdAt)
 * - Pagination
 * - Balance calculation (CREDIT - DEBIT per karigar)
 * 
 * PERFORMANCE:
 * - Single query with grouped transactions
 * - Uses Prisma `include` + `_sum` for balance
 * - Indexed columns (name, phone, deletedAt)
 * 
 * USAGE:
 *   const result = await getKarigars({ search: "Raj", page: 1 });
 *   if (result.success) { console.log(result.data.items); }
 */

import { prisma } from "@/lib/prisma";
import type { ApiResponse, PaginatedResponse } from "@/types";
import type { KarigarWithBalance, KarigarFilters } from "../types";

// ═══════════════════════════════════════════════════════════
// SERVER ACTION
// ═══════════════════════════════════════════════════════════

export async function getKarigars(
  filters: KarigarFilters = {}
): Promise<ApiResponse<PaginatedResponse<KarigarWithBalance>>> {
  try {
    // ═══════════════════════════════════════════
    // PARSE FILTERS
    // ═══════════════════════════════════════════
    const {
      search,
      isActive,
      includeDeleted = false,
      sortBy = "createdAt",
      sortOrder = "desc",
      page = 1,
      limit = 20,
    } = filters;

    // ═══════════════════════════════════════════
    // BUILD WHERE CLAUSE
    // ═══════════════════════════════════════════
    const where: {
      deletedAt: Date | null;
      isActive?: boolean;
      OR?: Array<
        | { name: { contains: string; mode: "insensitive" } }
        | { phone: { contains: string } }
      >;
    } = {
      deletedAt: includeDeleted ? undefined : null,
    };

    if (typeof isActive === "boolean") {
      where.isActive = isActive;
    }

    if (search && search.trim().length > 0) {
      const q = search.trim();
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { phone: { contains: q } },
      ];
    }

    // ═══════════════════════════════════════════
    // BUILD ORDER BY
    // ═══════════════════════════════════════════
    const orderBy = (() => {
      if (sortBy === "name") return { name: sortOrder };
      if (sortBy === "createdAt") return { createdAt: sortOrder };
      // For "balance" sort, we sort by name (balance is computed after)
      return { name: sortOrder };
    })();

    // ═══════════════════════════════════════════
    // PAGINATION
    // ═══════════════════════════════════════════
    const skip = (page - 1) * limit;

    // ═══════════════════════════════════════════
    // PARALLEL QUERIES
    // ═══════════════════════════════════════════
    const [total, karigars] = await Promise.all([
      // Count total matching
      prisma.karigar.count({ where }),

      // Fetch page with transactions (for balance)
      prisma.karigar.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          transactions: {
            where: { deletedAt: null },
            select: {
              amount: true,
              direction: true,
            },
          },
        },
      }),
    ]);

    // ═══════════════════════════════════════════
    // COMPUTE BALANCE
    // ═══════════════════════════════════════════
    const items: KarigarWithBalance[] = karigars.map((k) => {
      const totalCredit = k.transactions
        .filter((t) => t.direction === "CREDIT")
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const totalDebit = k.transactions
        .filter((t) => t.direction === "DEBIT")
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const balance = totalCredit - totalDebit;

      // Return Karigar without transactions (for cleaner UI)
      const { transactions, ...karigarData } = k;

      return {
        ...karigarData,
        balance,
        totalCredit,
        totalDebit,
        transactionCount: transactions.length,
      };
    });

    // ═══════════════════════════════════════════
    // SORT BY BALANCE (post-compute)
    // ═══════════════════════════════════════════
    if (sortBy === "balance") {
      items.sort((a, b) =>
        sortOrder === "desc" ? b.balance - a.balance : a.balance - b.balance
      );
    }

    // ═══════════════════════════════════════════
    // BUILD PAGINATION METADATA
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
    console.error("[getKarigars] Error:", error);

    return {
      success: false,
      error: "Failed to load karigars",
    };
  }
}
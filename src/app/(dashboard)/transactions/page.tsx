/**
 * Transactions List Page — Server Component
 * 
 * FEATURES:
 * - Server-side data fetch (getTransactions)
 * - Search (description, reference)
 * - Filter by type (5 types)
 * - Filter by direction (credit, debit)
 * - Grid layout (1 col mobile, 2 col desktop)
 * - Empty states
 * - Pagination
 * - "Add Transaction" button
 * 
 * USAGE:
 *   http://localhost:3000/transactions?type=WORK&search=saree
 */

import Link from "next/link";
import { Plus, Receipt, Search as SearchIcon } from "lucide-react";
import { getTransactions } from "@/features/transaction/actions/get-transactions";
import { TransactionList } from "@/features/transaction/components/transaction-list";
import { Button } from "@/components/ui/button";
import { ROUTES, TRANSACTION_TYPES, TRANSACTION_TYPE_LABELS } from "@/config/constants";
import type { TransactionFilters } from "@/features/transaction/types";

export const metadata = {
  title: "Transactions | Kanani Creation Ledger",
  description: "View and manage all transactions",
};

// ═══════════════════════════════════════════════════════════
// SEARCH PARAMS TYPE
// ═══════════════════════════════════════════════════════════

interface PageProps {
  searchParams: Promise<{
    search?: string;
    type?: string;
    direction?: string;
    page?: string;
  }>;
}

// ═══════════════════════════════════════════════════════════
// PAGE COMPONENT
// ═══════════════════════════════════════════════════════════

export default async function TransactionsPage({ searchParams }: PageProps) {
  const params = await searchParams;

  // Build filters from URL
  const filters: TransactionFilters = {
    search: params.search,
    type: params.type as any,
    direction: params.direction as any,
    page: params.page ? parseInt(params.page, 10) : 1,
    limit: 20,
    sortBy: "date",
    sortOrder: "desc",
  };

  const result = await getTransactions(filters);

  // Handle error
  if (!result.success) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="p-6 rounded-2xl bg-red-50 border border-red-100 text-center">
          <p className="text-sm text-red-700 font-medium">
            Failed to load transactions. Please refresh.
          </p>
        </div>
      </div>
    );
  }

  const { items, pagination } = result.data;
  const hasFilters = !!(params.search || params.type || params.direction);
  const isEmpty = items.length === 0;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* ═══════════════════════════════════════════ */}
      {/* PAGE HEADER */}
      {/* ═══════════════════════════════════════════ */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-[10px] font-semibold tracking-wide uppercase">
            <Receipt className="w-3 h-3" />
            Transactions
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">
            Transactions
          </h1>
          <p className="text-sm text-slate-500">
            {pagination.total} {pagination.total === 1 ? "entry" : "entries"} total
          </p>
        </div>

        {/* Add Button */}
        <Button
          asChild
          className="h-11 rounded-xl bg-slate-900 hover:bg-slate-800 w-full sm:w-auto"
        >
          <Link href={ROUTES.TRANSACTION_NEW}>
            <Plus className="w-4 h-4 mr-2" />
            Add Transaction
          </Link>
        </Button>
      </div>

      {/* ═══════════════════════════════════════════ */}
      {/* SEARCH + FILTERS */}
      {/* ═══════════════════════════════════════════ */}
      <TransactionFiltersBar
        currentSearch={params.search ?? ""}
        currentType={params.type ?? "all"}
        currentDirection={params.direction ?? "all"}
      />

      {/* ═══════════════════════════════════════════ */}
      {/* LIST / EMPTY STATE */}
      {/* ═══════════════════════════════════════════ */}
      {isEmpty ? (
        <EmptyState hasFilters={hasFilters} searchQuery={params.search} />
      ) : (
        <>
          <TransactionList transactions={items} showKarigar={true} />

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-slate-200/60">
              <p className="text-xs text-slate-500">
                Page {pagination.page} of {pagination.totalPages}
              </p>
              <div className="flex gap-2">
                {pagination.hasPrev && (
                  <Button asChild variant="outline" size="sm" className="h-9">
                    <Link href={buildPageUrl(params, pagination.page - 1)}>
                      Previous
                    </Link>
                  </Button>
                )}
                {pagination.hasNext && (
                  <Button asChild variant="outline" size="sm" className="h-9">
                    <Link href={buildPageUrl(params, pagination.page + 1)}>
                      Next
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// FILTERS BAR
// ═══════════════════════════════════════════════════════════

function TransactionFiltersBar({
  currentSearch,
  currentType,
  currentDirection,
}: {
  currentSearch: string;
  currentType: string;
  currentDirection: string;
}) {
  const TYPE_FILTERS = [
    { value: "all", label: "All Types" },
    ...Object.values(TRANSACTION_TYPES).map((type) => ({
      value: type,
      label: TRANSACTION_TYPE_LABELS[type],
    })),
  ];

  const DIRECTION_FILTERS = [
    { value: "all", label: "All" },
    { value: "CREDIT", label: "Credit" },
    { value: "DEBIT", label: "Debit" },
  ];

  const buildFilterHref = (updates: Record<string, string>) => {
    const query = new URLSearchParams();
    const merged = {
      search: currentSearch,
      type: currentType === "all" ? "" : currentType,
      direction: currentDirection === "all" ? "" : currentDirection,
      ...updates,
    };
    Object.entries(merged).forEach(([key, val]) => {
      if (val && val !== "all") query.set(key, val);
    });
    const qs = query.toString();
    return `/transactions${qs ? `?${qs}` : ""}`;
  };

  return (
    <div className="rounded-2xl bg-white border border-slate-200/60 p-4 space-y-3">
      
      {/* Search */}
      <form method="GET" className="relative">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        <input
          type="search"
          name="search"
          defaultValue={currentSearch}
          placeholder="Search description or reference..."
          className="w-full h-11 pl-10 pr-4 rounded-xl bg-slate-50 border border-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900/5 transition-all"
        />
        {currentType !== "all" && (
          <input type="hidden" name="type" value={currentType} />
        )}
        {currentDirection !== "all" && (
          <input type="hidden" name="direction" value={currentDirection} />
        )}
      </form>

      {/* Type Filters */}
      <div className="space-y-2">
        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
          Type
        </p>
        <div className="flex items-center gap-1.5 flex-wrap">
          {TYPE_FILTERS.map((filter) => {
            const isActive = currentType === filter.value;
            return (
              <Link
                key={filter.value}
                href={buildFilterHref({
                  type: filter.value === "all" ? "" : filter.value,
                })}
                className={`inline-flex items-center px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? "bg-slate-900 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {filter.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Direction Filters */}
      <div className="space-y-2">
        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
          Direction
        </p>
        <div className="flex items-center gap-1.5 flex-wrap">
          {DIRECTION_FILTERS.map((filter) => {
            const isActive = currentDirection === filter.value;
            return (
              <Link
                key={filter.value}
                href={buildFilterHref({
                  direction: filter.value === "all" ? "" : filter.value,
                })}
                className={`inline-flex items-center px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? "bg-slate-900 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {filter.label}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// EMPTY STATE
// ═══════════════════════════════════════════════════════════

function EmptyState({
  hasFilters,
  searchQuery,
}: {
  hasFilters: boolean;
  searchQuery?: string;
}) {
  if (hasFilters) {
    return (
      <div className="rounded-2xl bg-white border border-slate-200/60 p-12 flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
          <SearchIcon className="w-7 h-7 text-slate-400" />
        </div>
        <h3 className="text-base font-semibold text-slate-900 mb-1">
          No transactions found
        </h3>
        <p className="text-sm text-slate-500 max-w-sm mb-5">
          {searchQuery
            ? `No results for "${searchQuery}". Try different search.`
            : "No transactions match the selected filters."}
        </p>
        <Button asChild variant="outline" className="h-10">
          <Link href={ROUTES.TRANSACTIONS}>Clear filters</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white border border-slate-200/60 p-12 flex flex-col items-center text-center">
      <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
        <Receipt className="w-7 h-7 text-slate-400" />
      </div>
      <h3 className="text-base font-semibold text-slate-900 mb-1">
        No transactions yet
      </h3>
      <p className="text-sm text-slate-500 max-w-sm mb-5 leading-relaxed">
        Start by recording your first transaction. Track work, payments, advances,
        and deductions for each karigar.
      </p>
      <Button asChild className="h-11 rounded-xl bg-slate-900 hover:bg-slate-800">
        <Link href={ROUTES.TRANSACTION_NEW}>
          <Plus className="w-4 h-4 mr-2" />
          Add First Transaction
        </Link>
      </Button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════

function buildPageUrl(
  params: { search?: string; type?: string; direction?: string },
  page: number
): string {
  const query = new URLSearchParams();
  if (params.search) query.set("search", params.search);
  if (params.type) query.set("type", params.type);
  if (params.direction) query.set("direction", params.direction);
  if (page > 1) query.set("page", page.toString());
  const qs = query.toString();
  return `/transactions${qs ? `?${qs}` : ""}`;
}
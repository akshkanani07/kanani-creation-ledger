/**
 * Ledger List Page — All Karigars
 * 
 * Shows list of all karigars with their balances.
 * Click on any karigar → Opens their running ledger.
 * 
 * FEATURES:
 * - List of karigars with balance
 * - Search by name/phone
 * - Filter by active/inactive
 * - Click → Ledger detail
 * - Summary stats
 * 
 * USAGE:
 *   http://localhost:3000/ledger
 *   http://localhost:3000/ledger?search=raj&filter=active
 */

import Link from "next/link";
import { BookOpen, Search as SearchIcon, Users, ChevronRight } from "lucide-react";
import { getKarigars } from "@/features/karigar/actions/get-karigars";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn, formatCurrency, getInitials } from "@/lib/utils";
import { formatPhone } from "@/utils/format-phone";
import { ROUTES } from "@/config/constants";
import type { KarigarFilters } from "@/features/karigar/types";

export const metadata = {
  title: "Ledger | Kanani Creation Ledger",
  description: "View ledger for all karigars",
};

// ═══════════════════════════════════════════════════════════
// PAGE PROPS
// ═══════════════════════════════════════════════════════════

interface PageProps {
  searchParams: Promise<{
    search?: string;
    filter?: string;
    page?: string;
  }>;
}

// ═══════════════════════════════════════════════════════════
// PAGE COMPONENT
// ═══════════════════════════════════════════════════════════

export default async function LedgerListPage({ searchParams }: PageProps) {
  const params = await searchParams;

  const filters: KarigarFilters = {
    search: params.search,
    isActive:
      params.filter === "active"
        ? true
        : params.filter === "inactive"
          ? false
          : undefined,
    page: params.page ? parseInt(params.page, 10) : 1,
    limit: 50,
    sortBy: "balance",
    sortOrder: "desc",
  };

  const result = await getKarigars(filters);

  if (!result.success) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="p-6 rounded-2xl bg-red-50 border border-red-100 text-center">
          <p className="text-sm text-red-700 font-medium">
            Failed to load karigars. Please refresh.
          </p>
        </div>
      </div>
    );
  }

  const { items, pagination } = result.data;
  const hasFilters = !!(params.search || params.filter);
  const isEmpty = items.length === 0;

  // Calculate totals
  const totalCredit = items.reduce((sum, k) => sum + k.balance, 0);
  const creditCount = items.filter((k) => k.balance > 0.01).length;
  const debitCount = items.filter((k) => k.balance < -0.01).length;
  const settledCount = items.filter((k) => Math.abs(k.balance) <= 0.01).length;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* ═══════════════════════════════════════════ */}
      {/* PAGE HEADER */}
      {/* ═══════════════════════════════════════════ */}
      <div className="space-y-1">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-[10px] font-semibold tracking-wide uppercase">
          <BookOpen className="w-3 h-3" />
          Ledger
        </div>
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">
          Running Ledger
        </h1>
        <p className="text-sm text-slate-500">
          Select a karigar to view their complete ledger with running balance
        </p>
      </div>

      {/* ═══════════════════════════════════════════ */}
      {/* SUMMARY CARDS */}
      {/* ═══════════════════════════════════════════ */}
      {!isEmpty && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          {/* Total Pending */}
          <div className="rounded-2xl bg-white border border-slate-200/60 p-4">
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Total Pending
            </p>
            <p className="text-lg lg:text-2xl font-bold text-slate-900 tabular-nums">
              {formatCurrency(totalCredit)}
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5">
              Across {pagination.total} karigars
            </p>
          </div>

          {/* Credit Karigars */}
          <div className="rounded-2xl bg-white border border-slate-200/60 p-4">
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                We Owe
              </p>
            </div>
            <p className="text-lg lg:text-2xl font-bold text-emerald-600 tabular-nums">
              {creditCount}
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5">
              Karigars (CREDIT)
            </p>
          </div>

          {/* Debit Karigars */}
          <div className="rounded-2xl bg-white border border-slate-200/60 p-4">
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                Owe Us
              </p>
            </div>
            <p className="text-lg lg:text-2xl font-bold text-amber-600 tabular-nums">
              {debitCount}
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5">
              Karigars (DEBIT)
            </p>
          </div>

          {/* Settled */}
          <div className="rounded-2xl bg-white border border-slate-200/60 p-4">
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                Settled
              </p>
            </div>
            <p className="text-lg lg:text-2xl font-bold text-slate-500 tabular-nums">
              {settledCount}
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5">
              No pending balance
            </p>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════ */}
      {/* SEARCH + FILTERS */}
      {/* ═══════════════════════════════════════════ */}
      <LedgerFiltersBar
        currentSearch={params.search ?? ""}
        currentFilter={params.filter ?? "all"}
      />

      {/* ═══════════════════════════════════════════ */}
      {/* LIST / EMPTY STATE */}
      {/* ═══════════════════════════════════════════ */}
      {isEmpty ? (
        <EmptyState hasFilters={hasFilters} searchQuery={params.search} />
      ) : (
        <div className="rounded-2xl bg-white border border-slate-200/60 overflow-hidden">
          <ul className="divide-y divide-slate-100">
            {items.map((karigar) => (
              <LedgerListItem key={karigar.id} karigar={karigar} />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// LEDGER LIST ITEM
// ═══════════════════════════════════════════════════════════

function LedgerListItem({
  karigar,
}: {
  karigar: {
    id: string;
    name: string;
    phone: string;
    photoUrl: string | null;
    balance: number;
    transactionCount: number;
    isActive: boolean;
  };
}) {
  const initials = getInitials(karigar.name);
  const hasBalance = Math.abs(karigar.balance) > 0.01;
  const isCredit = karigar.balance > 0;

  return (
    <li>
      <Link
        href={ROUTES.LEDGER_DETAIL(karigar.id)}
        className="group flex items-center gap-3 px-4 lg:px-5 py-3.5 hover:bg-slate-50 transition-colors"
      >
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <Avatar className="h-11 w-11 ring-2 ring-white shadow-sm">
            {karigar.photoUrl ? (
              <AvatarImage src={karigar.photoUrl} alt={karigar.name} />
            ) : null}
            <AvatarFallback className="bg-slate-900 text-white text-xs font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          {!karigar.isActive && (
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-slate-400 border-2 border-white" />
          )}
          {karigar.isActive && (
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white" />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-slate-900 truncate">
              {karigar.name}
            </p>
            {!karigar.isActive && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-medium bg-slate-100 text-slate-500">
                Inactive
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <p className="text-xs text-slate-500">
              {formatPhone(karigar.phone)}
            </p>
            <span className="w-1 h-1 rounded-full bg-slate-300" />
            <p className="text-xs text-slate-500">
              {karigar.transactionCount}{" "}
              {karigar.transactionCount === 1 ? "entry" : "entries"}
            </p>
          </div>
        </div>

        {/* Balance */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="text-right">
            {hasBalance ? (
              <>
                <p
                  className={cn(
                    "text-sm font-bold tabular-nums",
                    isCredit ? "text-emerald-600" : "text-amber-600"
                  )}
                >
                  {formatCurrency(Math.abs(karigar.balance))}
                </p>
                <p
                  className={cn(
                    "text-[10px] font-semibold uppercase tracking-wider",
                    isCredit ? "text-emerald-500" : "text-amber-500"
                  )}
                >
                  {isCredit ? "CREDIT" : "DEBIT"}
                </p>
              </>
            ) : (
              <p className="text-xs font-medium text-slate-400">Settled</p>
            )}
          </div>

          <ChevronRight className="w-4 h-4 text-slate-400 transition-transform group-hover:translate-x-0.5" />
        </div>
      </Link>
    </li>
  );
}

// ═══════════════════════════════════════════════════════════
// FILTERS BAR
// ═══════════════════════════════════════════════════════════

function LedgerFiltersBar({
  currentSearch,
  currentFilter,
}: {
  currentSearch: string;
  currentFilter: string;
}) {
  const FILTERS = [
    { value: "all", label: "All" },
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
  ];

  return (
    <div className="rounded-2xl bg-white border border-slate-200/60 p-4 space-y-3">
      
      {/* Search */}
      <form method="GET" className="relative">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        <input
          type="search"
          name="search"
          defaultValue={currentSearch}
          placeholder="Search by name or phone..."
          className="w-full h-11 pl-10 pr-4 rounded-xl bg-slate-50 border border-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900/5 transition-all"
        />
        {currentFilter !== "all" && (
          <input type="hidden" name="filter" value={currentFilter} />
        )}
      </form>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {FILTERS.map((filter) => {
          const isActive = currentFilter === filter.value;
          const href = `/ledger?${
            currentSearch ? `search=${encodeURIComponent(currentSearch)}&` : ""
          }${filter.value !== "all" ? `filter=${filter.value}` : ""}`;

          return (
            <Link
              key={filter.value}
              href={href}
              className={cn(
                "inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                isActive
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              )}
            >
              {filter.label}
            </Link>
          );
        })}
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
          No karigars found
        </h3>
        <p className="text-sm text-slate-500 max-w-sm mb-5">
          {searchQuery
            ? `No results for "${searchQuery}". Try a different search.`
            : "No karigars match the selected filter."}
        </p>
        <Button asChild variant="outline" className="h-10">
          <Link href="/ledger">Clear filters</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white border border-slate-200/60 p-12 flex flex-col items-center text-center">
      <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
        <Users className="w-7 h-7 text-slate-400" />
      </div>
      <h3 className="text-base font-semibold text-slate-900 mb-1">
        No karigars yet
      </h3>
      <p className="text-sm text-slate-500 max-w-sm mb-5 leading-relaxed">
        Add your first karigar to start tracking their ledger.
      </p>
      <Button asChild className="h-11 rounded-xl bg-slate-900 hover:bg-slate-800">
        <Link href={ROUTES.KARIGAR_NEW}>Add First Karigar</Link>
      </Button>
    </div>
  );
}
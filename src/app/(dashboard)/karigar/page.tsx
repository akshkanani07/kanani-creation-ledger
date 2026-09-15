/**
 * Karigar List Page — Server Component
 * 
 * FEATURES:
 * - Server-side data fetch (getKarigars)
 * - Search (name, phone)
 * - Filter (all, active, inactive)
 * - Grid layout (1 col mobile, 2 col tablet, 3 col desktop)
 * - Empty state (no karigars / no results)
 * - Pagination info
 * - "Add Karigar" button
 * - Delete dialog integration
 * 
 * USAGE:
 *   http://localhost:3000/karigar?search=raj&filter=active
 */

import Link from "next/link";
import { Plus, Users, Search as SearchIcon } from "lucide-react";
import { getKarigars } from "@/features/karigar/actions/get-karigars";
import { KarigarList } from "@/features/karigar/components/karigar-list";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/config/constants";
import type { KarigarFilters } from "@/features/karigar/types";

export const metadata = {
  title: "Karigars | Kanani Creation Ledger",
  description: "Manage your karigars",
};

// ═══════════════════════════════════════════════════════════
// SEARCH PARAMS TYPE
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

export default async function KarigarPage({ searchParams }: PageProps) {
  const params = await searchParams;

  // Build filters from URL
  const filters: KarigarFilters = {
    search: params.search,
    isActive:
      params.filter === "active"
        ? true
        : params.filter === "inactive"
          ? false
          : undefined,
    page: params.page ? parseInt(params.page, 10) : 1,
    limit: 20,
    sortBy: "name",
    sortOrder: "asc",
  };

  const result = await getKarigars(filters);

  // Handle error
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

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* ═══════════════════════════════════════════ */}
      {/* PAGE HEADER */}
      {/* ═══════════════════════════════════════════ */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-[10px] font-semibold tracking-wide uppercase">
            <Users className="w-3 h-3" />
            Karigars
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">
            Karigars
          </h1>
          <p className="text-sm text-slate-500">
            {pagination.total} {pagination.total === 1 ? "karigar" : "karigars"} total
          </p>
        </div>

        {/* Add Button */}
        <Button
          asChild
          className="h-11 rounded-xl bg-slate-900 hover:bg-slate-800 w-full sm:w-auto"
        >
          <Link href={ROUTES.KARIGAR_NEW}>
            <Plus className="w-4 h-4 mr-2" />
            Add Karigar
          </Link>
        </Button>
      </div>

      {/* ═══════════════════════════════════════════ */}
      {/* SEARCH + FILTERS */}
      {/* ═══════════════════════════════════════════ */}
      <KarigarFiltersBar
        currentSearch={params.search ?? ""}
        currentFilter={params.filter ?? "all"}
      />

      {/* ═══════════════════════════════════════════ */}
      {/* LIST / EMPTY STATE */}
      {/* ═══════════════════════════════════════════ */}
      {isEmpty ? (
        <EmptyState
          hasFilters={hasFilters}
          searchQuery={params.search}
        />
      ) : (
        <>
          {/* ✅ KarigarList — Client Component with Delete Dialog */}
          <KarigarList karigars={items} />

          {/* Pagination Info */}
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
// FILTERS BAR (Client-side state via URL)
// ═══════════════════════════════════════════════════════════

function KarigarFiltersBar({
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
      
      {/* Search Bar */}
      <form method="GET" className="relative">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        <input
          type="search"
          name="search"
          defaultValue={currentSearch}
          placeholder="Search by name or phone..."
          className="w-full h-11 pl-10 pr-4 rounded-xl bg-slate-50 border border-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900/5 transition-all"
        />
        {/* Preserve filter when searching */}
        {currentFilter !== "all" && (
          <input type="hidden" name="filter" value={currentFilter} />
        )}
      </form>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {FILTERS.map((filter) => {
          const isActive = currentFilter === filter.value;
          const href = `/karigar?${
            currentSearch ? `search=${encodeURIComponent(currentSearch)}&` : ""
          }${filter.value !== "all" ? `filter=${filter.value}` : ""}`;

          return (
            <Link
              key={filter.value}
              href={href}
              className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
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
    // Search found no results
    return (
      <div className="rounded-2xl bg-white border border-slate-200/60 p-12 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
          <SearchIcon className="w-7 h-7 text-slate-400" />
        </div>
        <h3 className="text-base font-semibold text-slate-900 mb-1">
          No karigars found
        </h3>
        <p className="text-sm text-slate-500 max-w-sm mb-5 leading-relaxed">
          {searchQuery
            ? `No results for "${searchQuery}". Try a different search.`
            : "No karigars match the selected filter."}
        </p>
        <Button asChild variant="outline" className="h-10">
          <Link href={ROUTES.KARIGAR}>Clear filters</Link>
        </Button>
      </div>
    );
  }

  // No karigars at all
  return (
    <div className="rounded-2xl bg-white border border-slate-200/60 p-12 flex flex-col items-center justify-center text-center">
      <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
        <Users className="w-7 h-7 text-slate-400" />
      </div>
      <h3 className="text-base font-semibold text-slate-900 mb-1">
        No karigars yet
      </h3>
      <p className="text-sm text-slate-500 max-w-sm mb-5 leading-relaxed">
        Get started by adding your first karigar. You&apos;ll be able to track
        their work, payments, and running balance.
      </p>
      <Button asChild className="h-11 rounded-xl bg-slate-900 hover:bg-slate-800">
        <Link href={ROUTES.KARIGAR_NEW}>
          <Plus className="w-4 h-4 mr-2" />
          Add First Karigar
        </Link>
      </Button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════

function buildPageUrl(
  params: { search?: string; filter?: string },
  page: number
): string {
  const query = new URLSearchParams();
  if (params.search) query.set("search", params.search);
  if (params.filter) query.set("filter", params.filter);
  if (page > 1) query.set("page", page.toString());
  const qs = query.toString();
  return `/karigar${qs ? `?${qs}` : ""}`;
}
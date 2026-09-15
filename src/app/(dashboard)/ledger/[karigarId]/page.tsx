/**
 * Ledger Page — Karigar Running Ledger
 * 
 * FEATURES:
 * - Full ledger with running balance
 * - Date range filter (from / to)
 * - Summary stats (opening, credit, debit, closing)
 * - Ledger table (desktop + mobile)
 * - Export buttons (redirect to reports)
 * - Share button (WhatsApp via reports)
 * 
 * USAGE:
 *   http://localhost:3000/ledger/abc123
 *   http://localhost:3000/ledger/abc123?from=2026-04-01&to=2026-09-30
 */

import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  TrendingUp,
  TrendingDown,
  Wallet,
  FileText,
  Download,
  Share2,
  Hash,
} from "lucide-react";
import { getLedger } from "@/features/ledger/actions/get-ledger";
import { LedgerTable } from "@/features/ledger/components/ledger-table";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn, formatCurrency, getInitials } from "@/lib/utils";
import { formatPhone } from "@/utils/format-phone";
import { ROUTES } from "@/config/constants";

export const metadata = {
  title: "Ledger | Kanani Creation Ledger",
  description: "Running ledger for karigar",
};

// ═══════════════════════════════════════════════════════════
// PAGE PROPS
// ═══════════════════════════════════════════════════════════

interface PageProps {
  params: Promise<{ karigarId: string }>;
  searchParams: Promise<{
    from?: string;
    to?: string;
  }>;
}

// ═══════════════════════════════════════════════════════════
// PAGE COMPONENT
// ═══════════════════════════════════════════════════════════

export default async function LedgerPage({
  params,
  searchParams,
}: PageProps) {
  const { karigarId } = await params;
  const search = await searchParams;

  const dateFrom = search.from ? new Date(search.from) : undefined;
  const dateTo = search.to ? new Date(search.to) : undefined;

  const result = await getLedger({
    karigarId,
    dateFrom,
    dateTo,
  });

  if (!result.success) {
    if (result.error === "Karigar not found") {
      notFound();
    }
    return (
      <div className="max-w-7xl mx-auto">
        <div className="p-6 rounded-2xl bg-red-50 border border-red-100 text-center">
          <p className="text-sm text-red-700 font-medium">
            Failed to load ledger. Please refresh.
          </p>
        </div>
      </div>
    );
  }

  const { karigar, entries, summary } = result.data;
  const initials = getInitials(karigar.name);

  const hasBalance = Math.abs(summary.closingBalance) > 0.01;
  const isCredit = summary.closingBalance > 0;
  const hasRange = !!(dateFrom || dateTo);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* BACK BUTTON */}
      <Link
        href={ROUTES.KARIGAR_DETAIL(karigarId)}
        className="group inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
        Back to {karigar.name}
      </Link>

      {/* HEADER */}
      <div className="rounded-2xl bg-white border border-slate-200/60 overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-slate-900 via-blue-600 to-indigo-600" />

        <div className="p-5 lg:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <Avatar className="h-14 w-14 ring-2 ring-white shadow-md flex-shrink-0">
              {karigar.photoUrl ? (
                <AvatarImage src={karigar.photoUrl} alt={karigar.name} />
              ) : null}
              <AvatarFallback className="bg-slate-900 text-white text-base font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl lg:text-2xl font-bold text-slate-900 tracking-tight">
                  {karigar.name}
                </h1>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600">
                  <Hash className="w-2.5 h-2.5" />
                  Running Ledger
                </span>
              </div>
              <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 flex-wrap">
                <span>📞 {formatPhone(karigar.phone)}</span>
                {karigar.address && (
                  <>
                    <span className="w-1 h-1 rounded-full bg-slate-300" />
                    <span className="truncate max-w-xs">
                      📍 {karigar.address}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Actions — Export/Share to Reports */}
            <div className="flex items-center gap-2">
              <Button
                asChild
                variant="outline"
                size="sm"
                className="h-9 rounded-lg"
              >
                <Link
                  href={buildReportsUrl(
                    karigarId,
                    search.from,
                    search.to,
                    "pdf"
                  )}
                >
                  <Download className="w-3.5 h-3.5 mr-1.5" />
                  Export
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="sm"
                className="h-9 rounded-lg border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
              >
                <Link
                  href={buildReportsUrl(
                    karigarId,
                    search.from,
                    search.to,
                    "whatsapp"
                  )}
                >
                  <Share2 className="w-3.5 h-3.5 mr-1.5" />
                  Share
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <SummaryCard
          label="Opening Balance"
          value={
            summary.openingBalance === 0
              ? "₹0"
              : formatCurrency(Math.abs(summary.openingBalance))
          }
          suffix={
            summary.openingBalance === 0
              ? undefined
              : summary.openingBalance > 0
                ? "Cr"
                : "Dr"
          }
          description={hasRange ? "Before range" : "Start of ledger"}
          icon={Calendar}
          accentColor="slate"
        />

        <SummaryCard
          label="Total Credit"
          value={formatCurrency(summary.totalCredit)}
          description={`${entries.filter((e) => e.direction === "CREDIT").length} entries`}
          icon={TrendingUp}
          accentColor="emerald"
        />

        <SummaryCard
          label="Total Debit"
          value={formatCurrency(summary.totalDebit)}
          description={`${entries.filter((e) => e.direction === "DEBIT").length} entries`}
          icon={TrendingDown}
          accentColor="amber"
        />

        <div className="relative overflow-hidden rounded-2xl bg-slate-900 p-4 lg:p-5">
          <div className="absolute -top-8 -right-8 w-24 h-24 bg-blue-500/20 rounded-full blur-3xl" />

          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="w-3.5 h-3.5 text-slate-400" />
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Closing Balance
              </p>
            </div>

            {hasBalance ? (
              <>
                <p className="text-xl lg:text-2xl font-bold text-white tabular-nums">
                  {formatCurrency(Math.abs(summary.closingBalance))}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  {isCredit ? "CREDIT (we owe)" : "DEBIT (owes us)"}
                </p>
              </>
            ) : (
              <>
                <p className="text-xl lg:text-2xl font-bold text-white">
                  Settled
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  No pending balance
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* DATE FILTER */}
      <LedgerDateFilter
        karigarId={karigarId}
        currentFrom={search.from ?? ""}
        currentTo={search.to ?? ""}
        hasRange={hasRange}
      />

      {/* LEDGER TABLE */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              Transaction History
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {entries.length === 0
                ? "No transactions in selected range"
                : `${entries.length} ${entries.length === 1 ? "entry" : "entries"}`}
            </p>
          </div>
        </div>

        <LedgerTable
          entries={entries}
          openingBalance={hasRange ? summary.openingBalance : 0}
        />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// SUMMARY CARD
// ═══════════════════════════════════════════════════════════

function SummaryCard({
  label,
  value,
  suffix,
  description,
  icon: Icon,
  accentColor,
}: {
  label: string;
  value: string;
  suffix?: string;
  description: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  accentColor: "slate" | "emerald" | "amber" | "blue";
}) {
  const ACCENT_STYLES = {
    slate: {
      iconBg: "bg-slate-100",
      iconColor: "text-slate-700",
      bar: "bg-slate-900",
    },
    emerald: {
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
      bar: "bg-emerald-500",
    },
    amber: {
      iconBg: "bg-amber-50",
      iconColor: "text-amber-600",
      bar: "bg-amber-500",
    },
    blue: {
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
      bar: "bg-blue-500",
    },
  };

  const styles = ACCENT_STYLES[accentColor];

  return (
    <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200/60 p-4">
      <div className={cn("absolute top-0 left-0 right-0 h-0.5", styles.bar)} />

      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0 space-y-1.5">
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
            {label}
          </p>
          <div className="flex items-baseline gap-1">
            <p className="text-lg lg:text-xl font-bold text-slate-900 tabular-nums">
              {value}
            </p>
            {suffix && (
              <span className="text-[10px] font-medium text-slate-500">
                {suffix}
              </span>
            )}
          </div>
          <p className="text-[10px] text-slate-500">{description}</p>
        </div>

        <div
          className={cn(
            "flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center",
            styles.iconBg
          )}
        >
          <Icon className={cn("w-4 h-4", styles.iconColor)} strokeWidth={2.25} />
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// DATE FILTER
// ═══════════════════════════════════════════════════════════

function LedgerDateFilter({
  karigarId,
  currentFrom,
  currentTo,
  hasRange,
}: {
  karigarId: string;
  currentFrom: string;
  currentTo: string;
  hasRange: boolean;
}) {
  return (
    <div className="rounded-2xl bg-white border border-slate-200/60 p-4">
      <form method="GET" className="space-y-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-500" />
          <p className="text-xs font-semibold text-slate-700">Date Range</p>
          {hasRange && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700">
              Filtered
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          <div className="space-y-1">
            <label
              htmlFor="from"
              className="text-[10px] font-medium text-slate-500"
            >
              From
            </label>
            <input
              id="from"
              type="date"
              name="from"
              defaultValue={currentFrom}
              max={currentTo || new Date().toISOString().split("T")[0]}
              className="w-full h-10 px-3 rounded-lg bg-slate-50 border border-transparent text-xs text-slate-900 focus:bg-white focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900/5 transition-all"
            />
          </div>

          <div className="space-y-1">
            <label
              htmlFor="to"
              className="text-[10px] font-medium text-slate-500"
            >
              To
            </label>
            <input
              id="to"
              type="date"
              name="to"
              defaultValue={currentTo}
              max={new Date().toISOString().split("T")[0]}
              className="w-full h-10 px-3 rounded-lg bg-slate-50 border border-transparent text-xs text-slate-900 focus:bg-white focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900/5 transition-all"
            />
          </div>

          <div className="flex items-end gap-2 col-span-2 sm:col-span-1">
            <Button
              type="submit"
              size="sm"
              className="flex-1 h-10 rounded-lg bg-slate-900 hover:bg-slate-800"
            >
              Apply
            </Button>
            {hasRange && (
              <Button
                asChild
                type="button"
                variant="outline"
                size="sm"
                className="flex-1 h-10 rounded-lg"
              >
                <Link href={`/ledger/${karigarId}`}>Clear</Link>
              </Button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap pt-1">
          <span className="text-[10px] font-medium text-slate-500 mr-1">
            Quick:
          </span>
          <QuickFilter
            label="This Month"
            href={buildQuickFilter(karigarId, "month")}
          />
          <QuickFilter
            label="Last 30 Days"
            href={buildQuickFilter(karigarId, "30days")}
          />
          <QuickFilter
            label="This Year"
            href={buildQuickFilter(karigarId, "year")}
          />
          <QuickFilter label="All Time" href={`/ledger/${karigarId}`} />
        </div>
      </form>
    </div>
  );
}

function QuickFilter({ label, href }: { label: string; href: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 hover:bg-slate-200 text-[10px] font-medium transition-colors"
    >
      {label}
    </Link>
  );
}

// ═══════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════

function buildQuickFilter(
  karigarId: string,
  range: "month" | "30days" | "year"
): string {
  const now = new Date();
  const from = new Date();

  if (range === "month") {
    from.setDate(1);
  } else if (range === "30days") {
    from.setDate(now.getDate() - 30);
  } else if (range === "year") {
    from.setMonth(0, 1);
  }

  const fromStr = from.toISOString().split("T")[0];
  const toStr = now.toISOString().split("T")[0];

  return `/ledger/${karigarId}?from=${fromStr}&to=${toStr}`;
}

/**
 * Build Reports URL with pre-filled filters + auto-trigger action.
 * 
 * @param karigarId - Karigar to report on
 * @param from - Date from (ISO string)
 * @param to - Date to (ISO string)
 * @param action - Auto-trigger: "pdf" | "excel" | "whatsapp"
 */
function buildReportsUrl(
  karigarId: string,
  from: string | undefined,
  to: string | undefined,
  action: "pdf" | "excel" | "whatsapp"
): string {
  const params = new URLSearchParams();
  params.set("scope", "karigar");
  params.set("karigarId", karigarId);
  if (from) params.set("from", from);
  if (to) params.set("to", to);
  params.set("action", action);

  return `/reports?${params.toString()}`;
}
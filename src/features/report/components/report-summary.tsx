"use client";

/**
 * Report Summary — Preview Section
 * 
 * FEATURES:
 * - Preview of report data before export
 * - Summary cards (varies by scope)
 * - Karigar info preview (for karigar scope)
 * - Type distribution (for by-type scope)
 * - Recent transactions preview
 * 
 * USAGE:
 *   <ReportSummary data={reportData} />
 */

import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Users,
  Receipt,
  User,
  PieChart,
  Hash,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn, formatCurrency, getInitials } from "@/lib/utils";
import { formatPhone } from "@/utils/format-phone";
import {
  TRANSACTION_TYPE_LABELS,
  PAYMENT_MODE_LABELS,
} from "@/config/constants";
import type { ReportData } from "../types";

// ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════

interface ReportSummaryProps {
  data: ReportData;
}

// ═══════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════

export function ReportSummary({ data }: ReportSummaryProps) {
  return (
    <div className="space-y-4">
      
      {/* ═══════════════════════════════════════════ */}
      {/* HEADER */}
      {/* ═══════════════════════════════════════════ */}
      <div className="flex items-center gap-2">
        <div className="w-1 h-5 bg-slate-900 rounded-full" />
        <h2 className="text-sm font-semibold text-slate-900 tracking-tight">
          Report Preview
        </h2>
        <span className="text-[10px] text-slate-400 font-medium tracking-wide uppercase">
          • {data.metadata.period.label}
        </span>
      </div>

      {/* ═══════════════════════════════════════════ */}
      {/* SCOPE-SPECIFIC CONTENT */}
      {/* ═══════════════════════════════════════════ */}
      {data.scope === "karigar" && <KarigarSummaryView data={data} />}
      {data.scope === "all-karigars" && <AllKarigarsSummaryView data={data} />}
      {data.scope === "by-type" && <ByTypeSummaryView data={data} />}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// VIEW 1 — KARIGAR
// ═══════════════════════════════════════════════════════════

function KarigarSummaryView({
  data,
}: {
  data: Extract<ReportData, { scope: "karigar" }>;
}) {
  const { karigar, transactions } = data;
  const initials = getInitials(karigar.name);
  const hasBalance = Math.abs(karigar.closingBalance) > 0.01;
  const isCredit = karigar.closingBalance > 0;

  // Recent 5 transactions
  const recentTransactions = [...transactions].reverse().slice(0, 5);

  return (
    <div className="space-y-4">
      
      {/* ═══════════════════════════════════════════ */}
      {/* KARIGAR INFO CARD */}
      {/* ═══════════════════════════════════════════ */}
      <div className="rounded-2xl bg-white border border-slate-200/60 overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-slate-900 via-blue-600 to-indigo-600" />

        <div className="p-5 flex items-center gap-4">
          <Avatar className="h-14 w-14 ring-2 ring-white shadow-md flex-shrink-0">
            {karigar.photoUrl ? (
              <AvatarImage src={karigar.photoUrl} alt={karigar.name} />
            ) : null}
            <AvatarFallback className="bg-slate-900 text-white text-base font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-slate-900 tracking-tight truncate">
              {karigar.name}
            </h3>
            <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
              <span>{formatPhone(karigar.phone)}</span>
              {karigar.address && (
                <>
                  <span className="w-1 h-1 rounded-full bg-slate-300" />
                  <span className="truncate">{karigar.address}</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════ */}
      {/* BALANCE SUMMARY */}
      {/* ═══════════════════════════════════════════ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <SummaryCard
          label="Opening"
          value={
            karigar.openingBalance === 0
              ? "₹0"
              : formatCurrency(Math.abs(karigar.openingBalance))
          }
          suffix={
            karigar.openingBalance === 0
              ? undefined
              : karigar.openingBalance > 0
                ? "Cr"
                : "Dr"
          }
          icon={Wallet}
          accentColor="slate"
        />

        <SummaryCard
          label="Total Credit"
          value={formatCurrency(karigar.totalCredit)}
          icon={TrendingUp}
          accentColor="emerald"
        />

        <SummaryCard
          label="Total Debit"
          value={formatCurrency(karigar.totalDebit)}
          icon={TrendingDown}
          accentColor="amber"
        />

        {/* Closing Balance — Dark Hero */}
        <div className="relative overflow-hidden rounded-2xl bg-slate-900 p-4">
          <div className="absolute -top-8 -right-8 w-24 h-24 bg-blue-500/20 rounded-full blur-3xl" />

          <div className="relative">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Closing
            </p>
            <p className="text-lg lg:text-xl font-bold text-white tabular-nums">
              {hasBalance
                ? formatCurrency(Math.abs(karigar.closingBalance))
                : "Settled"}
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">
              {hasBalance
                ? isCredit
                  ? "CREDIT (we owe)"
                  : "DEBIT (owes us)"
                : "No pending balance"}
            </p>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════ */}
      {/* RECENT TRANSACTIONS */}
      {/* ═══════════════════════════════════════════ */}
      {recentTransactions.length > 0 && (
        <div className="rounded-2xl bg-white border border-slate-200/60 overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900">
                Recent Transactions
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">
                Latest {recentTransactions.length} of {transactions.length}
              </p>
            </div>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600">
              <Receipt className="w-2.5 h-2.5" />
              {transactions.length}
            </span>
          </div>

          <ul className="divide-y divide-slate-100">
            {recentTransactions.map((tx) => {
              const isTxCredit = tx.direction === "CREDIT";
              return (
                <li
                  key={tx.id}
                  className="px-5 py-2.5 flex items-center gap-3 hover:bg-slate-50/50 transition-colors"
                >
                  <div
                    className={cn(
                      "flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center",
                      isTxCredit
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-amber-50 text-amber-600"
                    )}
                  >
                    {isTxCredit ? (
                      <TrendingUp className="w-3.5 h-3.5" strokeWidth={2.5} />
                    ) : (
                      <TrendingDown className="w-3.5 h-3.5" strokeWidth={2.5} />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-semibold text-slate-900">
                        {TRANSACTION_TYPE_LABELS[tx.type]}
                      </p>
                      <span className="text-[10px] text-slate-400">
                        {formatShortDate(tx.date)}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate">
                      {tx.description}
                    </p>
                  </div>

                  <p
                    className={cn(
                      "text-xs font-bold tabular-nums flex-shrink-0",
                      isTxCredit ? "text-emerald-600" : "text-amber-600"
                    )}
                  >
                    {isTxCredit ? "+" : "−"}
                    {formatCurrency(tx.amount)}
                  </p>
                </li>
              );
            })}
          </ul>

          {transactions.length > 5 && (
            <div className="px-5 py-2.5 bg-slate-50 border-t border-slate-100 text-center">
              <p className="text-[10px] text-slate-500">
                + {transactions.length - 5} more in the full report
              </p>
            </div>
          )}
        </div>
      )}

      {transactions.length === 0 && (
        <div className="rounded-2xl bg-white border border-slate-200/60 p-8 text-center">
          <p className="text-sm text-slate-500">
            No transactions in the selected period.
          </p>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// VIEW 2 — ALL KARIGARS
// ═══════════════════════════════════════════════════════════

function AllKarigarsSummaryView({
  data,
}: {
  data: Extract<ReportData, { scope: "all-karigars" }>;
}) {
  const { karigars, totals } = data;

  return (
    <div className="space-y-4">
      
      {/* ═══════════════════════════════════════════ */}
      {/* TOTALS */}
      {/* ═══════════════════════════════════════════ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <SummaryCard
          label="Karigars"
          value={totals.totalKarigars.toString()}
          icon={Users}
          accentColor="slate"
        />

        <SummaryCard
          label="Total Credit"
          value={formatCurrency(totals.totalCredit)}
          icon={TrendingUp}
          accentColor="emerald"
        />

        <SummaryCard
          label="Total Debit"
          value={formatCurrency(totals.totalDebit)}
          icon={TrendingDown}
          accentColor="amber"
        />

        <div className="relative overflow-hidden rounded-2xl bg-slate-900 p-4">
          <div className="absolute -top-8 -right-8 w-24 h-24 bg-blue-500/20 rounded-full blur-3xl" />
          <div className="relative">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Net Pending
            </p>
            <p className="text-lg lg:text-xl font-bold text-white tabular-nums">
              {formatCurrency(Math.abs(totals.totalClosing))}
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">
              {totals.totalClosing > 0.01
                ? "We owe karigars"
                : totals.totalClosing < -0.01
                  ? "Karigars owe us"
                  : "All settled"}
            </p>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════ */}
      {/* PREVIEW — Top 5 Karigars */}
      {/* ═══════════════════════════════════════════ */}
      <div className="rounded-2xl bg-white border border-slate-200/60 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-900">
              Preview
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5">
              First 5 of {karigars.length} karigars
            </p>
          </div>
        </div>

        <ul className="divide-y divide-slate-100">
          {karigars.slice(0, 5).map((k) => {
            const isCredit = k.closingBalance > 0.01;
            const isDebit = k.closingBalance < -0.01;
            const isSettled = !isCredit && !isDebit;
            const initials = getInitials(k.name);

            return (
              <li
                key={k.id}
                className="px-5 py-2.5 flex items-center gap-3 hover:bg-slate-50/50 transition-colors"
              >
                <Avatar className="h-8 w-8 flex-shrink-0">
                  {k.photoUrl ? (
                    <AvatarImage src={k.photoUrl} alt={k.name} />
                  ) : null}
                  <AvatarFallback className="bg-slate-900 text-white text-[10px] font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-900 truncate">
                    {k.name}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    {k.transactionCount} entries
                  </p>
                </div>

                <div className="text-right flex-shrink-0">
                  <p
                    className={cn(
                      "text-xs font-bold tabular-nums",
                      isCredit
                        ? "text-emerald-600"
                        : isDebit
                          ? "text-amber-600"
                          : "text-slate-400"
                    )}
                  >
                    {isSettled
                      ? "Settled"
                      : formatCurrency(Math.abs(k.closingBalance))}
                  </p>
                  {!isSettled && (
                    <p
                      className={cn(
                        "text-[9px] font-semibold",
                        isCredit ? "text-emerald-500" : "text-amber-500"
                      )}
                    >
                      {isCredit ? "CR" : "DR"}
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ul>

        {karigars.length > 5 && (
          <div className="px-5 py-2.5 bg-slate-50 border-t border-slate-100 text-center">
            <p className="text-[10px] text-slate-500">
              + {karigars.length - 5} more in the full report
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// VIEW 3 — BY TYPE
// ═══════════════════════════════════════════════════════════

function ByTypeSummaryView({
  data,
}: {
  data: Extract<ReportData, { scope: "by-type" }>;
}) {
  const { distribution, transactions } = data;

  const totalCount = distribution.reduce((sum, d) => sum + d.count, 0);
  const totalAmount = distribution.reduce((sum, d) => sum + d.totalAmount, 0);

  return (
    <div className="space-y-4">
      
      {/* ═══════════════════════════════════════════ */}
      {/* TOTALS */}
      {/* ═══════════════════════════════════════════ */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <SummaryCard
          label="Types"
          value={distribution.length.toString()}
          icon={PieChart}
          accentColor="slate"
        />

        <SummaryCard
          label="Total Entries"
          value={totalCount.toString()}
          icon={Hash}
          accentColor="blue"
        />

        <div className="relative overflow-hidden rounded-2xl bg-slate-900 p-4">
          <div className="absolute -top-8 -right-8 w-24 h-24 bg-blue-500/20 rounded-full blur-3xl" />
          <div className="relative">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Total Amount
            </p>
            <p className="text-lg lg:text-xl font-bold text-white tabular-nums">
              {formatCurrency(totalAmount)}
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Across all types
            </p>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════ */}
      {/* DISTRIBUTION */}
      {/* ═══════════════════════════════════════════ */}
      <div className="rounded-2xl bg-white border border-slate-200/60 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100">
          <p className="text-sm font-semibold text-slate-900">
            Type Distribution
          </p>
          <p className="text-[10px] text-slate-500 mt-0.5">
            Breakdown by transaction type
          </p>
        </div>

        <ul className="divide-y divide-slate-100">
          {distribution.map((item) => {
            const percentage =
              totalAmount > 0 ? (item.totalAmount / totalAmount) * 100 : 0;

            return (
              <li
                key={item.type}
                className="px-5 py-3 hover:bg-slate-50/50 transition-colors"
              >
                <div className="flex items-center justify-between gap-3 mb-1.5">
                  <p className="text-xs font-semibold text-slate-900">
                    {TRANSACTION_TYPE_LABELS[item.type]}
                  </p>
                  <p className="text-xs font-bold tabular-nums text-slate-900">
                    {formatCurrency(item.totalAmount)}
                  </p>
                </div>

                {/* Progress Bar */}
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-slate-900 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 tabular-nums w-10 text-right">
                    {percentage.toFixed(1)}%
                  </span>
                  <span className="text-[10px] text-slate-500 tabular-nums w-12 text-right">
                    {item.count} txn
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
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
  icon: Icon,
  accentColor,
}: {
  label: string;
  value: string;
  suffix?: string;
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
// HELPERS
// ═══════════════════════════════════════════════════════════

function formatShortDate(date: Date): string {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
  });
}
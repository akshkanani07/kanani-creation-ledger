"use client";

/**
 * Ledger Table — Desktop + Mobile Responsive
 * 
 * FEATURES:
 * - Desktop: Full table (Date, Type, Description, Amount, Balance)
 * - Mobile: Card layout
 * - Running balance highlighted
 * - Sticky header (desktop)
 * - Direction-based colors
 * - Work details (quantity × rate)
 * - Empty state
 * 
 * USAGE:
 *   <LedgerTable entries={entries} />
 */

import {
  ArrowUpRight,
  ArrowDownLeft,
  Receipt,
  Hash,
  FileText,
  Wallet,
} from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { formatDate } from "@/utils/format-date";
import { TRANSACTION_TYPE_LABELS, PAYMENT_MODE_LABELS } from "@/config/constants";
import type { LedgerEntry } from "../types";

// ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════

interface LedgerTableProps {
  entries: LedgerEntry[];
  /** Show "Opening Balance" row at top */
  openingBalance?: number;
}

// ═══════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════

export function LedgerTable({ entries, openingBalance = 0 }: LedgerTableProps) {
  // ═══════════════════════════════════════════
  // EMPTY STATE
  // ═══════════════════════════════════════════
  if (entries.length === 0 && openingBalance === 0) {
    return <EmptyState />;
  }

  // ═══════════════════════════════════════════
  // DISPLAY: Latest First
  // ═══════════════════════════════════════════
  const displayEntries = [...entries].reverse();

  return (
    <>
      {/* ═══════════════════════════════════════════ */}
      {/* DESKTOP TABLE */}
      {/* ═══════════════════════════════════════════ */}
      <div className="hidden lg:block rounded-2xl bg-white border border-slate-200/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200/60">
              <tr>
                <th className="text-left px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="text-left px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="text-left px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="text-right px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="text-right px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                  Balance
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {/* Opening Balance Row */}
              {openingBalance !== 0 && (
                <tr className="bg-slate-50/50">
                  <td className="px-5 py-3 text-xs text-slate-500 italic">
                    —
                  </td>
                  <td className="px-5 py-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600">
                      Opening
                    </span>
                  </td>
                  <td className="px-5 py-3 text-xs text-slate-500 italic">
                    Balance before selected range
                  </td>
                  <td className="px-5 py-3 text-right text-xs text-slate-400">
                    —
                  </td>
                  <td className="px-5 py-3 text-right">
                    <BalanceCell balance={openingBalance} bold />
                  </td>
                </tr>
              )}

              {/* Transaction Rows */}
              {displayEntries.map((entry) => (
                <LedgerRow key={entry.id} entry={entry} />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ═══════════════════════════════════════════ */}
      {/* MOBILE CARDS */}
      {/* ═══════════════════════════════════════════ */}
      <div className="lg:hidden space-y-3">
        {/* Opening Balance Card */}
        {openingBalance !== 0 && (
          <div className="rounded-xl bg-slate-50 border border-slate-200/60 p-3.5">
            <div className="flex items-center justify-between gap-3">
              <div className="space-y-0.5">
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                  Opening Balance
                </p>
                <p className="text-xs text-slate-500 italic">
                  Before selected range
                </p>
              </div>
              <BalanceCell balance={openingBalance} bold />
            </div>
          </div>
        )}

        {/* Transaction Cards */}
        {displayEntries.map((entry) => (
          <LedgerCard key={entry.id} entry={entry} />
        ))}
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════
// DESKTOP ROW
// ═══════════════════════════════════════════════════════════

function LedgerRow({ entry }: { entry: LedgerEntry }) {
  const isCredit = entry.direction === "CREDIT";

  return (
    <tr className="hover:bg-slate-50/50 transition-colors">
      {/* Date */}
      <td className="px-5 py-3 whitespace-nowrap">
        <p className="text-xs font-medium text-slate-700">
          {formatDate(entry.date, "DISPLAY")}
        </p>
      </td>

      {/* Type */}
      <td className="px-5 py-3 whitespace-nowrap">
        <span
          className={cn(
            "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold",
            isCredit
              ? "bg-emerald-50 text-emerald-700"
              : "bg-amber-50 text-amber-700"
          )}
        >
          {TRANSACTION_TYPE_LABELS[entry.type]}
        </span>
      </td>

      {/* Description */}
      <td className="px-5 py-3 max-w-md">
        <div className="space-y-0.5">
          <p className="text-xs text-slate-700 line-clamp-2 leading-relaxed">
            {entry.description}
          </p>

          {/* Work Details */}
          {entry.type === "WORK" && entry.quantity && entry.rate && (
            <p className="text-[10px] text-slate-400">
              {entry.quantity} × {formatCurrency(entry.rate)} ={" "}
              {formatCurrency(entry.amount)}
            </p>
          )}

          {/* Reference + Payment Mode */}
          <div className="flex items-center gap-2 flex-wrap">
            {entry.reference && (
              <span className="inline-flex items-center gap-1 text-[10px] text-slate-400">
                <Hash className="w-2.5 h-2.5" />
                {entry.reference}
              </span>
            )}
            {entry.paymentMode && (
              <span className="inline-flex items-center gap-1 text-[10px] text-slate-400">
                <Wallet className="w-2.5 h-2.5" />
                {PAYMENT_MODE_LABELS[entry.paymentMode as keyof typeof PAYMENT_MODE_LABELS]}
              </span>
            )}
          </div>
        </div>
      </td>

      {/* Amount */}
      <td className="px-5 py-3 text-right whitespace-nowrap">
        <div className="inline-flex items-center gap-1">
          {isCredit ? (
            <ArrowUpRight className="w-3 h-3 text-emerald-500" strokeWidth={2.5} />
          ) : (
            <ArrowDownLeft className="w-3 h-3 text-amber-500" strokeWidth={2.5} />
          )}
          <span
            className={cn(
              "text-sm font-bold tabular-nums",
              isCredit ? "text-emerald-600" : "text-amber-600"
            )}
          >
            {isCredit ? "+" : "−"}
            {formatCurrency(entry.amount)}
          </span>
        </div>
      </td>

      {/* Balance */}
      <td className="px-5 py-3 text-right whitespace-nowrap">
        <BalanceCell balance={entry.runningBalance} bold />
      </td>
    </tr>
  );
}

// ═══════════════════════════════════════════════════════════
// MOBILE CARD
// ═══════════════════════════════════════════════════════════

function LedgerCard({ entry }: { entry: LedgerEntry }) {
  const isCredit = entry.direction === "CREDIT";

  return (
    <div className="rounded-xl bg-white border border-slate-200/60 p-3.5">
      {/* Top Row — Date + Type */}
      <div className="flex items-center justify-between gap-3 mb-2">
        <p className="text-[10px] font-medium text-slate-500">
          {formatDate(entry.date, "DISPLAY")}
        </p>
        <span
          className={cn(
            "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold",
            isCredit
              ? "bg-emerald-50 text-emerald-700"
              : "bg-amber-50 text-amber-700"
          )}
        >
          {TRANSACTION_TYPE_LABELS[entry.type]}
        </span>
      </div>

      {/* Description */}
      <p className="text-xs text-slate-700 leading-relaxed mb-2">
        {entry.description}
      </p>

      {/* Work Details */}
      {entry.type === "WORK" && entry.quantity && entry.rate && (
        <p className="text-[10px] text-slate-400 mb-2">
          {entry.quantity} × {formatCurrency(entry.rate)}
        </p>
      )}

      {/* Reference + Payment Mode */}
      {(entry.reference || entry.paymentMode) && (
        <div className="flex items-center gap-2 flex-wrap mb-2">
          {entry.reference && (
            <span className="inline-flex items-center gap-1 text-[10px] text-slate-400">
              <Hash className="w-2.5 h-2.5" />
              {entry.reference}
            </span>
          )}
          {entry.paymentMode && (
            <span className="inline-flex items-center gap-1 text-[10px] text-slate-400">
              <Wallet className="w-2.5 h-2.5" />
              {PAYMENT_MODE_LABELS[entry.paymentMode as keyof typeof PAYMENT_MODE_LABELS]}
            </span>
          )}
        </div>
      )}

      {/* Bottom Row — Amount + Balance */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
        <div className="flex items-center gap-1.5">
          {isCredit ? (
            <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500" strokeWidth={2.5} />
          ) : (
            <ArrowDownLeft className="w-3.5 h-3.5 text-amber-500" strokeWidth={2.5} />
          )}
          <span
            className={cn(
              "text-sm font-bold tabular-nums",
              isCredit ? "text-emerald-600" : "text-amber-600"
            )}
          >
            {isCredit ? "+" : "−"}
            {formatCurrency(entry.amount)}
          </span>
        </div>

        <BalanceCell balance={entry.runningBalance} bold compact />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// BALANCE CELL
// ═══════════════════════════════════════════════════════════

function BalanceCell({
  balance,
  bold = false,
  compact = false,
}: {
  balance: number;
  bold?: boolean;
  compact?: boolean;
}) {
  const isSettled = Math.abs(balance) < 0.01;
  const isCredit = balance > 0;

  if (isSettled) {
    return (
      <span
        className={cn(
          "tabular-nums",
          bold ? "text-xs font-semibold" : "text-xs",
          "text-slate-400"
        )}
      >
        Settled
      </span>
    );
  }

  return (
    <span
      className={cn(
        "tabular-nums whitespace-nowrap",
        compact ? "text-xs font-semibold" : "text-sm font-bold",
        isCredit ? "text-slate-900" : "text-red-600"
      )}
    >
      {formatCurrency(Math.abs(balance))}
      <span className="text-[10px] font-medium ml-1 opacity-70">
        {isCredit ? "Cr" : "Dr"}
      </span>
    </span>
  );
}

// ═══════════════════════════════════════════════════════════
// EMPTY STATE
// ═══════════════════════════════════════════════════════════

function EmptyState() {
  return (
    <div className="rounded-2xl bg-white border border-slate-200/60 p-12 flex flex-col items-center text-center">
      <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
        <Receipt className="w-7 h-7 text-slate-400" strokeWidth={2} />
      </div>
      <h3 className="text-base font-semibold text-slate-900 mb-1">
        No transactions yet
      </h3>
      <p className="text-sm text-slate-500 max-w-sm leading-relaxed">
        This karigar doesn&apos;t have any transactions in the selected range.
      </p>
    </div>
  );
}
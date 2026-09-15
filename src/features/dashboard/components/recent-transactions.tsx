/**
 * Recent Transactions — Dashboard Widget
 * 
 * FEATURES:
 * - Shows last 5 transactions across all karigars
 * - Direction-based color coding (CREDIT=green, DEBIT=amber)
 * - Time ago formatting
 * - Empty state
 * - "View All" link to transactions page
 * 
 * SERVER COMPONENT:
 * - Direct Prisma access (no client JS)
 * - Fast rendering
 * - Auto-refresh on navigation
 */

import Link from "next/link";
import {
  ArrowUpRight,
  ArrowDownLeft,
  ArrowRight,
  Inbox,
  type LucideIcon,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { cn, formatCurrency, formatRelativeTime } from "@/lib/utils";
import { ROUTES, TRANSACTION_TYPE_LABELS } from "@/config/constants";
import type { TransactionType } from "@/config/constants";

// ═══════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════

export async function RecentTransactions() {
  // ═══════════════════════════════════════════
  // FETCH LAST 5 TRANSACTIONS
  // ═══════════════════════════════════════════
  const transactions = await prisma.transaction.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" },
    take: 5,
    include: {
      karigar: {
        select: {
          id: true,
          name: true,
          photoUrl: true,
        },
      },
    },
  });

  // ═══════════════════════════════════════════
  // EMPTY STATE
  // ═══════════════════════════════════════════
  if (transactions.length === 0) {
    return <EmptyState />;
  }

  return (
    <section className="space-y-4">
      
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-900 tracking-tight">
            Recent Transactions
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Latest activity across all karigars
          </p>
        </div>
        <Link
          href={ROUTES.TRANSACTIONS}
          className="group inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors"
        >
          View all
          <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
        </Link>
      </div>

      {/* Transactions List */}
      <div className="rounded-2xl bg-white border border-slate-200/60 overflow-hidden">
        <ul className="divide-y divide-slate-100">
          {transactions.map((tx) => (
            <TransactionRow key={tx.id} transaction={tx} />
          ))}
        </ul>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════
// TRANSACTION ROW
// ═══════════════════════════════════════════════════════════

interface TransactionRowProps {
  transaction: {
    id: string;
    type: TransactionType;
    direction: "CREDIT" | "DEBIT";
    amount: unknown; // Prisma Decimal
    description: string;
    createdAt: Date;
    karigar: {
      id: string;
      name: string;
      photoUrl: string | null;
    };
  };
}

function TransactionRow({ transaction }: TransactionRowProps) {
  const isCredit = transaction.direction === "CREDIT";
  const amount = Number(transaction.amount);
  const initials = transaction.karigar.name
    .split(" ")
    .map((w) => w.charAt(0))
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const DirectionIcon = isCredit ? ArrowUpRight : ArrowDownLeft;

  return (
    <li className="group">
      <Link
        href={`/transactions`}
        className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors"
      >
        {/* ═══════════════════════════════════════ */}
        {/* KARIGAR AVATAR */}
        {/* ═══════════════════════════════════════ */}
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden">
          {transaction.karigar.photoUrl ? (
            <img
              src={transaction.karigar.photoUrl}
              alt={transaction.karigar.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-xs font-semibold text-slate-600">
              {initials}
            </span>
          )}
        </div>

        {/* ═══════════════════════════════════════ */}
        {/* KARIGAR + DESCRIPTION */}
        {/* ═══════════════════════════════════════ */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-slate-900 truncate">
              {transaction.karigar.name}
            </p>
            <span
              className={cn(
                "inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium",
                isCredit
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-amber-50 text-amber-700"
              )}
            >
              {TRANSACTION_TYPE_LABELS[transaction.type]}
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <p className="text-xs text-slate-500 truncate">
              {transaction.description}
            </p>
            <span className="text-slate-300 flex-shrink-0">·</span>
            <p className="text-xs text-slate-400 flex-shrink-0">
              {formatRelativeTime(transaction.createdAt)}
            </p>
          </div>
        </div>

        {/* ═══════════════════════════════════════ */}
        {/* AMOUNT + DIRECTION */}
        {/* ═══════════════════════════════════════ */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="text-right">
            <p
              className={cn(
                "text-sm font-bold tabular-nums",
                isCredit ? "text-emerald-600" : "text-amber-600"
              )}
            >
              {isCredit ? "+" : "−"}
              {formatCurrency(amount)}
            </p>
          </div>
          <div
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center",
              isCredit
                ? "bg-emerald-50 text-emerald-600"
                : "bg-amber-50 text-amber-600"
            )}
          >
            <DirectionIcon className="w-4 h-4" strokeWidth={2.5} />
          </div>
        </div>
      </Link>
    </li>
  );
}

// ═══════════════════════════════════════════════════════════
// EMPTY STATE
// ═══════════════════════════════════════════════════════════

function EmptyState() {
  return (
    <section className="space-y-4">
      
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-900 tracking-tight">
            Recent Transactions
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Latest activity across all karigars
          </p>
        </div>
      </div>

      {/* Empty Card */}
      <div className="rounded-2xl bg-white border border-slate-200/60 p-10 flex flex-col items-center justify-center text-center">
        <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mb-4">
          <Inbox className="w-6 h-6 text-slate-400" strokeWidth={2} />
        </div>
        <h3 className="text-sm font-semibold text-slate-900 mb-1">
          No transactions yet
        </h3>
        <p className="text-xs text-slate-500 max-w-[240px] mb-4 leading-relaxed">
          Start by adding a karigar, then record their first work entry.
        </p>
        <Link
          href={ROUTES.KARIGAR_NEW}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-medium hover:bg-slate-800 transition-colors"
        >
          Add First Karigar
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </section>
  );
}
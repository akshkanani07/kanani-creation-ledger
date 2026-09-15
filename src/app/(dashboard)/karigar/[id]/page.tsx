/**
 * Karigar Detail Page — Server Component
 * 
 * Shows full karigar details + stats + transaction history.
 * 
 * SECTIONS:
 * 1. Back button
 * 2. Hero (Photo, Name, Phone, Status)
 * 3. Actions (Edit, Delete, Add Transaction)
 * 4. Stats (Balance, Credit, Debit, Count)
 * 5. Transaction History (Empty State or List)
 * 
 * DATA:
 * - Karigar with balance (getKarigarById)
 * - Recent transactions
 */

import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Phone,
  MapPin,
  Pencil,
  Plus,
  Receipt,
  TrendingUp,
  TrendingDown,
  Wallet,
  Circle,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn, formatCurrency, getInitials, formatRelativeTime } from "@/lib/utils";
import { formatPhone } from "@/utils/format-phone";
import { ROUTES, TRANSACTION_TYPE_LABELS } from "@/config/constants";

// ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════

interface PageProps {
  params: Promise<{ id: string }>;
}

// ═══════════════════════════════════════════════════════════
// PAGE COMPONENT
// ═══════════════════════════════════════════════════════════

export default async function KarigarDetailPage({ params }: PageProps) {
  const { id } = await params;

  // ═══════════════════════════════════════════
  // FETCH KARIGAR
  // ═══════════════════════════════════════════
  const karigar = await prisma.karigar.findFirst({
    where: { id, deletedAt: null },
    include: {
      transactions: {
        where: { deletedAt: null },
        orderBy: { transactionDate: "desc" },
        take: 10,
      },
    },
  });

  if (!karigar) {
    notFound();
  }

  // ═══════════════════════════════════════════
  // COMPUTE STATS
  // ═══════════════════════════════════════════
  const totalCredit = karigar.transactions
    .filter((t) => t.direction === "CREDIT")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalDebit = karigar.transactions
    .filter((t) => t.direction === "DEBIT")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const balance = totalCredit - totalDebit;
  const hasBalance = Math.abs(balance) > 0.01;
  const isCredit = balance > 0;
  const transactionCount = karigar.transactions.length;
  const initials = getInitials(karigar.name);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* ═══════════════════════════════════════════ */}
      {/* BACK BUTTON */}
      {/* ═══════════════════════════════════════════ */}
      <Link
        href={ROUTES.KARIGAR}
        className="group inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
        Back to Karigars
      </Link>

      {/* ═══════════════════════════════════════════ */}
      {/* HERO — KARIGAR INFO */}
      {/* ═══════════════════════════════════════════ */}
      <div className="rounded-2xl bg-white border border-slate-200/60 overflow-hidden">
        
        {/* Top Gradient Bar */}
        <div className="h-1 bg-gradient-to-r from-slate-900 via-blue-600 to-indigo-600" />

        <div className="p-6 lg:p-8">
          <div className="flex flex-col sm:flex-row items-start gap-5">
            
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <Avatar className="h-20 w-20 lg:h-24 lg:w-24 ring-2 ring-white shadow-lg">
                {karigar.photoUrl ? (
                  <AvatarImage src={karigar.photoUrl} alt={karigar.name} />
                ) : null}
                <AvatarFallback className="bg-slate-900 text-white text-2xl font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>

              {/* Status Dot */}
              <span
                className={cn(
                  "absolute bottom-1 right-1 w-5 h-5 rounded-full border-3 border-white",
                  karigar.isActive ? "bg-emerald-500" : "bg-slate-400"
                )}
              />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0 space-y-3">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">
                  {karigar.name}
                </h1>
                <div className="flex items-center gap-2 mt-1.5">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold",
                      karigar.isActive
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-slate-100 text-slate-600"
                    )}
                  >
                    <Circle className="w-2 h-2 fill-current" />
                    {karigar.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <span>{formatPhone(karigar.phone)}</span>
                </div>

                {karigar.address && (
                  <div className="flex items-start gap-2 text-sm text-slate-600">
                    <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
                    <span className="leading-relaxed">{karigar.address}</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2 pt-2">
                <Button
                  asChild
                  size="sm"
                  className="h-9 rounded-lg bg-slate-900 hover:bg-slate-800"
                >
                  <Link href={ROUTES.KARIGAR_EDIT(karigar.id)}>
                    <Pencil className="w-3.5 h-3.5 mr-1.5" />
                    Edit
                  </Link>
                </Button>

                <Button
                  asChild
                  size="sm"
                  variant="outline"
                  className="h-9 rounded-lg"
                >
                  <Link href={`${ROUTES.TRANSACTION_NEW}?karigarId=${karigar.id}`}>
                    <Plus className="w-3.5 h-3.5 mr-1.5" />
                    Add Transaction
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════ */}
      {/* STATS GRID */}
      {/* ═══════════════════════════════════════════ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        
        {/* Balance */}
        <div className="rounded-2xl bg-white border border-slate-200/60 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Wallet className="w-3.5 h-3.5 text-slate-400" />
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
              Balance
            </p>
          </div>
          {hasBalance ? (
            <>
              <p
                className={cn(
                  "text-xl lg:text-2xl font-bold tabular-nums",
                  isCredit ? "text-emerald-600" : "text-amber-600"
                )}
              >
                {formatCurrency(Math.abs(balance))}
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">
                {isCredit ? "CREDIT (we owe)" : "DEBIT (owes us)"}
              </p>
            </>
          ) : (
            <>
              <p className="text-xl lg:text-2xl font-bold text-slate-400">
                Settled
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">
                No pending balance
              </p>
            </>
          )}
        </div>

        {/* Credit */}
        <div className="rounded-2xl bg-white border border-slate-200/60 p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
              Total Credit
            </p>
          </div>
          <p className="text-xl lg:text-2xl font-bold text-slate-900 tabular-nums">
            {formatCurrency(totalCredit)}
          </p>
          <p className="text-[10px] text-slate-500 mt-0.5">Work value</p>
        </div>

        {/* Debit */}
        <div className="rounded-2xl bg-white border border-slate-200/60 p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="w-3.5 h-3.5 text-amber-500" />
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
              Total Debit
            </p>
          </div>
          <p className="text-xl lg:text-2xl font-bold text-slate-900 tabular-nums">
            {formatCurrency(totalDebit)}
          </p>
          <p className="text-[10px] text-slate-500 mt-0.5">Payments made</p>
        </div>

        {/* Transactions */}
        <div className="rounded-2xl bg-white border border-slate-200/60 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Receipt className="w-3.5 h-3.5 text-slate-400" />
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
              Transactions
            </p>
          </div>
          <p className="text-xl lg:text-2xl font-bold text-slate-900 tabular-nums">
            {transactionCount}
          </p>
          <p className="text-[10px] text-slate-500 mt-0.5">Total entries</p>
        </div>
      </div>

      {/* ═══════════════════════════════════════════ */}
      {/* RECENT TRANSACTIONS */}
      {/* ═══════════════════════════════════════════ */}
      <div className="rounded-2xl bg-white border border-slate-200/60 overflow-hidden">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              Transaction History
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {transactionCount === 0
                ? "No transactions yet"
                : `${transactionCount} transaction${transactionCount > 1 ? "s" : ""}`}
            </p>
          </div>
          {transactionCount > 0 && (
            <Link
              href={`/ledger/${karigar.id}`}
              className="text-xs font-medium text-slate-600 hover:text-slate-900"
            >
              View Ledger →
            </Link>
          )}
        </div>

        {/* Content */}
        {transactionCount === 0 ? (
          <div className="p-10 flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mb-3">
              <Receipt className="w-6 h-6 text-slate-400" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900 mb-1">
              No transactions yet
            </h3>
            <p className="text-xs text-slate-500 max-w-xs mb-4 leading-relaxed">
              Start by adding their first work entry or payment.
            </p>
            <Button
              asChild
              size="sm"
              className="h-9 rounded-lg bg-slate-900 hover:bg-slate-800"
            >
              <Link href={`${ROUTES.TRANSACTION_NEW}?karigarId=${karigar.id}`}>
                <Plus className="w-3.5 h-3.5 mr-1.5" />
                Add First Transaction
              </Link>
            </Button>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {karigar.transactions.map((tx) => {
              const txIsCredit = tx.direction === "CREDIT";
              const txAmount = Number(tx.amount);

              return (
                <li key={tx.id} className="px-5 py-3 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    {/* Icon */}
                    <div
                      className={cn(
                        "flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center",
                        txIsCredit
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-amber-50 text-amber-600"
                      )}
                    >
                      {txIsCredit ? (
                        <TrendingUp className="w-4 h-4" />
                      ) : (
                        <TrendingDown className="w-4 h-4" />
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-slate-900">
                          {TRANSACTION_TYPE_LABELS[tx.type as keyof typeof TRANSACTION_TYPE_LABELS]}
                        </p>
                        <span className="text-[10px] text-slate-400">
                          · {formatRelativeTime(tx.transactionDate)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 truncate mt-0.5">
                        {tx.description}
                      </p>
                    </div>

                    {/* Amount */}
                    <p
                      className={cn(
                        "text-sm font-bold tabular-nums flex-shrink-0",
                        txIsCredit ? "text-emerald-600" : "text-amber-600"
                      )}
                    >
                      {txIsCredit ? "+" : "−"}
                      {formatCurrency(txAmount)}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
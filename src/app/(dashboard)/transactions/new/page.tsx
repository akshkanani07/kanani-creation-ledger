/**
 * New Transaction Page
 * 
 * Add new transaction form.
 * 
 * FEATURES:
 * - Back button
 * - Page header
 * - Transaction form (create mode)
 * - Optional karigarId pre-select from URL query
 * 
 * USAGE:
 *   http://localhost:3000/transactions/new
 *   http://localhost:3000/transactions/new?karigarId=abc123
 */

import Link from "next/link";
import { ArrowLeft, PlusCircle } from "lucide-react";
import { TransactionForm } from "@/features/transaction/components/transaction-form";
import { ROUTES } from "@/config/constants";

export const metadata = {
  title: "Add Transaction | Kanani Creation Ledger",
  description: "Record a new transaction",
};

// ═══════════════════════════════════════════════════════════
// PAGE PROPS
// ═══════════════════════════════════════════════════════════

interface PageProps {
  searchParams: Promise<{
    karigarId?: string;
  }>;
}

// ═══════════════════════════════════════════════════════════
// PAGE COMPONENT
// ═══════════════════════════════════════════════════════════

export default async function NewTransactionPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const preSelectedKarigarId = params.karigarId;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      
      {/* ═══════════════════════════════════════════ */}
      {/* BACK BUTTON */}
      {/* ═══════════════════════════════════════════ */}
      <Link
        href={ROUTES.TRANSACTIONS}
        className="group inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5 transition-transform duration-200 group-hover:-translate-x-0.5" />
        Back to Transactions
      </Link>

      {/* ═══════════════════════════════════════════ */}
      {/* PAGE HEADER */}
      {/* ═══════════════════════════════════════════ */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-[10px] font-semibold tracking-wide uppercase">
          <PlusCircle className="w-3 h-3" />
          New Transaction
        </div>
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">
          Add Transaction
        </h1>
        <p className="text-sm text-slate-500 leading-relaxed">
          Record work, payment, advance, or deduction for a karigar.
          Changes are logged automatically.
        </p>
      </div>

      {/* ═══════════════════════════════════════════ */}
      {/* FORM */}
      {/* ═══════════════════════════════════════════ */}
      <TransactionForm
        mode="create"
        defaultKarigarId={preSelectedKarigarId}
      />
    </div>
  );
}
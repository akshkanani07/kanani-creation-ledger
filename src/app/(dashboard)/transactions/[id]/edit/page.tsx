/**
 * Edit Transaction Page
 * 
 * Pre-filled form with existing transaction data.
 * 
 * FEATURES:
 * - 404 if transaction not found
 * - Fetches transaction + karigar info
 * - Edit mode form
 * - Back to Transactions
 * 
 * USAGE:
 *   http://localhost:3000/transactions/abc123/edit
 */

import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Pencil } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { TransactionForm } from "@/features/transaction/components/transaction-form";
import { ROUTES } from "@/config/constants";
import type { Transaction } from "@/features/transaction/types";

export const metadata = {
  title: "Edit Transaction | Kanani Creation Ledger",
  description: "Update transaction details",
};

// ═══════════════════════════════════════════════════════════
// PAGE PROPS
// ═══════════════════════════════════════════════════════════

interface PageProps {
  params: Promise<{ id: string }>;
}

// ═══════════════════════════════════════════════════════════
// PAGE COMPONENT
// ═══════════════════════════════════════════════════════════

export default async function EditTransactionPage({ params }: PageProps) {
  const { id } = await params;

  // ═══════════════════════════════════════════
  // FETCH TRANSACTION
  // ═══════════════════════════════════════════
  const transaction = await prisma.transaction.findFirst({
    where: {
      id,
      deletedAt: null,
    },
    include: {
      karigar: {
        select: {
          id: true,
          name: true,
          phone: true,
        },
      },
    },
  });

  if (!transaction) {
    notFound();
  }

  // ═══════════════════════════════════════════
  // SERIALIZE (Decimal → Number)
  // ═══════════════════════════════════════════
  const serialized: Transaction & {
    karigar: { id: string; name: string; phone: string };
  } = {
    id: transaction.id,
    karigarId: transaction.karigarId,
    type: transaction.type,
    direction: transaction.direction,
    amount: Number(transaction.amount),
    quantity: transaction.quantity ? Number(transaction.quantity) : null,
    rate: transaction.rate ? Number(transaction.rate) : null,
    paymentMode: transaction.paymentMode,
    reference: transaction.reference,
    description: transaction.description,
    transactionDate: transaction.transactionDate,
    deletedAt: transaction.deletedAt,
    createdAt: transaction.createdAt,
    updatedAt: transaction.updatedAt,
    karigar: transaction.karigar,
  };

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
          <Pencil className="w-3 h-3" />
          Edit Transaction
        </div>
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">
          Edit Transaction
        </h1>
        <p className="text-sm text-slate-500 leading-relaxed">
          Update the transaction details for{" "}
          <span className="font-medium text-slate-700">
            {transaction.karigar.name}
          </span>
          . Changes are logged for audit trail.
        </p>
      </div>

      {/* ═══════════════════════════════════════════ */}
      {/* FORM */}
      {/* ═══════════════════════════════════════════ */}
      <TransactionForm mode="edit" initialData={serialized} />
    </div>
  );
}
"use client";

/**
 * Transaction List — Client Wrapper
 * 
 * WHY THIS EXISTS:
 * - Manages delete dialog state
 * - Wraps TransactionCard (client component)
 * - Used in Server Components (transactions/page, karigar detail)
 * 
 * FEATURES:
 * - Grid layout (transactions list)
 * - Delete confirmation dialog
 * - Empty state
 * 
 * USAGE:
 *   <TransactionList transactions={items} />
 *   <TransactionList transactions={karigar.transactions} showKarigar={false} />
 */

import { useState } from "react";
import { Receipt } from "lucide-react";
import { TransactionCard } from "./transaction-card";
import { TransactionDeleteDialog } from "./transaction-delete-dialog";
import type { TransactionWithKarigar } from "../types";

// ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════

interface TransactionListProps {
  transactions: TransactionWithKarigar[];
  showKarigar?: boolean;
  /** Compact spacing for embedded lists */
  compact?: boolean;
}

// ═══════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════

export function TransactionList({
  transactions,
  showKarigar = true,
  compact = false,
}: TransactionListProps) {
  const [deleteTarget, setDeleteTarget] =
    useState<TransactionWithKarigar | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleDeleteClick = (transaction: TransactionWithKarigar) => {
    setDeleteTarget(transaction);
    setIsDialogOpen(true);
  };

  if (transactions.length === 0) {
    return <EmptyState />;
  }

  return (
    <>
      <div
        className={
          compact
            ? "space-y-2"
            : "grid grid-cols-1 lg:grid-cols-2 gap-3"
        }
      >
        {transactions.map((tx) => (
          <TransactionCard
            key={tx.id}
            transaction={tx}
            onDelete={handleDeleteClick}
            showKarigar={showKarigar}
          />
        ))}
      </div>

      <TransactionDeleteDialog
        transaction={deleteTarget}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </>
  );
}

// ═══════════════════════════════════════════════════════════
// EMPTY STATE
// ═══════════════════════════════════════════════════════════

function EmptyState() {
  return (
    <div className="rounded-2xl bg-white border border-slate-200/60 p-10 flex flex-col items-center text-center">
      <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mb-3">
        <Receipt className="w-6 h-6 text-slate-400" strokeWidth={2} />
      </div>
      <h3 className="text-sm font-semibold text-slate-900 mb-1">
        No transactions found
      </h3>
      <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
        Try adjusting filters or add a new transaction.
      </p>
    </div>
  );
}
"use client";

/**
 * Transaction Delete Dialog — Confirmation
 * 
 * FEATURES:
 * - AlertDialog with confirmation
 * - Shows amount + type + karigar name
 * - Soft delete warning
 * - Loading state during deletion
 */

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { deleteTransaction } from "../actions/delete-transaction";
import { formatCurrency } from "@/lib/utils";
import { TRANSACTION_TYPE_LABELS } from "@/config/constants";
import type { TransactionWithKarigar } from "../types";

// ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════

interface TransactionDeleteDialogProps {
  transaction: TransactionWithKarigar | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

// ═══════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════

export function TransactionDeleteDialog({
  transaction,
  open,
  onOpenChange,
  onSuccess,
}: TransactionDeleteDialogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string>("");

  if (!transaction) return null;

  const isCredit = transaction.direction === "CREDIT";

  const handleDelete = () => {
    setError("");

    startTransition(async () => {
      const result = await deleteTransaction({ id: transaction.id });

      if (result.success) {
        toast.success(result.message ?? "Transaction deleted");
        onOpenChange(false);
        onSuccess?.();
        router.refresh();
      } else {
        setError(result.error);
        toast.error(result.error);
      }
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          {/* Warning Icon */}
          <div className="flex items-center justify-center mb-2">
            <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
              <AlertTriangle className="w-7 h-7 text-red-600" strokeWidth={2.25} />
            </div>
          </div>

          <AlertDialogTitle className="text-center text-lg font-semibold text-slate-900">
            Delete this transaction?
          </AlertDialogTitle>

          <AlertDialogDescription className="text-center text-sm text-slate-500 leading-relaxed pt-1">
            This entry will be hidden from the ledger. You can restore it later if
            needed.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* TRANSACTION PREVIEW */}
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 space-y-2">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-500">Karigar</p>
              <p className="text-sm font-semibold text-slate-900 truncate">
                {transaction.karigar.name}
              </p>
            </div>
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold flex-shrink-0 ${
                isCredit
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-amber-50 text-amber-700"
              }`}
            >
              {TRANSACTION_TYPE_LABELS[transaction.type]}
            </span>
          </div>

          <div>
            <p className="text-xs font-medium text-slate-500 mb-0.5">
              Description
            </p>
            <p className="text-xs text-slate-700 leading-relaxed line-clamp-2">
              {transaction.description}
            </p>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-200">
            <p className="text-xs font-medium text-slate-500">Amount</p>
            <p
              className={`text-base font-bold tabular-nums ${
                isCredit ? "text-emerald-600" : "text-amber-600"
              }`}
            >
              {isCredit ? "+" : "−"}
              {formatCurrency(transaction.amount)}
            </p>
          </div>
        </div>

        {/* INFO BOX */}
        <div className="p-3 rounded-lg bg-amber-50 border border-amber-100">
          <p className="text-[11px] text-amber-800 leading-relaxed">
            <strong>Note:</strong> Karigar balance will be updated automatically.
          </p>
        </div>

        {/* ERROR */}
        {error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-100">
            <p className="text-xs text-red-700">{error}</p>
          </div>
        )}

        {/* ACTIONS */}
        <AlertDialogFooter className="flex-col-reverse sm:flex-row gap-2 sm:gap-0">
          <AlertDialogCancel
            disabled={isPending}
            className="w-full sm:w-auto h-11 rounded-xl mt-0 sm:mt-0"
          >
            Cancel
          </AlertDialogCancel>

          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            disabled={isPending}
            className="w-full sm:w-auto h-11 rounded-xl bg-red-600 hover:bg-red-700 focus:ring-red-500/20"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Transaction
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
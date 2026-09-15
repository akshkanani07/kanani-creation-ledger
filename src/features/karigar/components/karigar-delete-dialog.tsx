"use client";

/**
 * Karigar Delete Dialog — Confirmation
 * 
 * FEATURES:
 * - AlertDialog with confirmation
 * - Shows karigar name + transaction count
 * - Soft delete warning
 * - Loading state during deletion
 * - Toast notifications
 * 
 * USAGE:
 *   <KarigarDeleteDialog
 *     karigar={karigar}
 *     open={isOpen}
 *     onOpenChange={setIsOpen}
 *   />
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
import { deleteKarigar } from "../actions/delete-karigar";
import type { KarigarWithBalance } from "../types";

// ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════

interface KarigarDeleteDialogProps {
  karigar: KarigarWithBalance | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

// ═══════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════

export function KarigarDeleteDialog({
  karigar,
  open,
  onOpenChange,
  onSuccess,
}: KarigarDeleteDialogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string>("");

  if (!karigar) return null;

  const transactionCount = karigar.transactionCount ?? 0;
  const hasTransactions = transactionCount > 0;

  // ═══════════════════════════════════════════
  // DELETE HANDLER
  // ═══════════════════════════════════════════
  const handleDelete = () => {
    setError("");

    startTransition(async () => {
      const result = await deleteKarigar({ id: karigar.id });

      if (result.success) {
        toast.success(result.message ?? "Karigar deleted");
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
            Delete &ldquo;{karigar.name}&rdquo;?
          </AlertDialogTitle>

          <AlertDialogDescription className="text-center text-sm text-slate-500 leading-relaxed pt-1">
            This karigar will be hidden from your lists. 
            You can restore them later if needed.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* ═══════════════════════════════════════════ */}
        {/* WARNING BOX */}
        {/* ═══════════════════════════════════════════ */}
        {hasTransactions && (
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-100">
            <div className="flex gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="text-xs font-semibold text-amber-900">
                  {transactionCount} transaction{transactionCount > 1 ? "s" : ""} found
                </p>
                <p className="text-[11px] text-amber-700 leading-relaxed">
                  Their transaction history will be preserved but hidden.
                  Reports will still include this data.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════ */}
        {/* ERROR */}
        {/* ═══════════════════════════════════════════ */}
        {error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-100">
            <p className="text-xs text-red-700">{error}</p>
          </div>
        )}

        {/* ═══════════════════════════════════════════ */}
        {/* ACTIONS */}
        {/* ═══════════════════════════════════════════ */}
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
                Delete Karigar
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
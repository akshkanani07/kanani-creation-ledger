"use client";

/**
 * Transaction Card — List Item
 * 
 * FEATURES:
 * - Direction-based color (CREDIT=green, DEBIT=amber)
 * - Karigar avatar + name
 * - Type badge
 * - Amount with direction
 * - Time relative
 * - Hover actions (Edit, Delete)
 * 
 * USAGE:
 *   <TransactionCard
 *     transaction={tx}
 *     onDelete={(tx) => openDeleteDialog(tx)}
 *     showKarigar={true}
 *   />
 */

import { useRouter } from "next/navigation";
import {
  MoreVertical,
  Pencil,
  Trash2,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn, formatCurrency, formatRelativeTime, getInitials } from "@/lib/utils";
import { TRANSACTION_TYPE_LABELS } from "@/config/constants";
import type { TransactionWithKarigar } from "../types";

// ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════

interface TransactionCardProps {
  transaction: TransactionWithKarigar;
  onDelete?: (transaction: TransactionWithKarigar) => void;
  showKarigar?: boolean;
}

// ═══════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════

export function TransactionCard({
  transaction,
  onDelete,
  showKarigar = true,
}: TransactionCardProps) {
  const router = useRouter();

  const isCredit = transaction.direction === "CREDIT";
  const amount = transaction.amount;
  const initials = getInitials(transaction.karigar.name);

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/transactions/${transaction.id}/edit`);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(transaction);
  };

  return (
    <div
      className={cn(
        "group relative rounded-xl bg-white border border-slate-200/60 p-3.5 transition-all",
        "hover:shadow-sm hover:border-slate-300/60"
      )}
    >
      <div className="flex items-center gap-3">
        
        {/* ═══════════════════════════════════════════ */}
        {/* KARIGAR AVATAR (Optional) */}
        {/* ═══════════════════════════════════════════ */}
        {showKarigar && (
          <div className="flex-shrink-0">
            <Avatar className="h-10 w-10 ring-2 ring-white shadow-sm">
              {transaction.karigar.photoUrl ? (
                <AvatarImage
                  src={transaction.karigar.photoUrl}
                  alt={transaction.karigar.name}
                />
              ) : null}
              <AvatarFallback className="bg-slate-900 text-white text-xs font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
          </div>
        )}

        {/* ═══════════════════════════════════════════ */}
        {/* MAIN INFO */}
        {/* ═══════════════════════════════════════════ */}
        <div className="flex-1 min-w-0 space-y-1">
          
          {/* Top Row: Type + Time */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Type Badge */}
            <span
              className={cn(
                "inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold",
                isCredit
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-amber-50 text-amber-700"
              )}
            >
              {TRANSACTION_TYPE_LABELS[transaction.type]}
            </span>

            {/* Time */}
            <span className="text-[10px] text-slate-400">
              {formatRelativeTime(transaction.transactionDate)}
            </span>
          </div>

          {/* Karigar Name (if not showing avatar) OR Description */}
          {showKarigar ? (
            <p className="text-xs font-medium text-slate-700 truncate">
              {transaction.karigar.name}
            </p>
          ) : null}

          {/* Description */}
          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
            {transaction.description}
          </p>

          {/* Work Details (Optional) */}
          {transaction.type === "WORK" &&
            transaction.quantity &&
            transaction.rate && (
              <p className="text-[10px] text-slate-400 mt-0.5">
                {transaction.quantity} × {formatCurrency(transaction.rate)} ={" "}
                {formatCurrency(amount)}
              </p>
            )}
        </div>

        {/* ═══════════════════════════════════════════ */}
        {/* AMOUNT + ACTIONS */}
        {/* ═══════════════════════════════════════════ */}
        <div className="flex items-center gap-2 flex-shrink-0">
          
          {/* Amount */}
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
            <div
              className={cn(
                "flex items-center justify-end gap-0.5 mt-0.5",
                isCredit ? "text-emerald-500" : "text-amber-500"
              )}
            >
              {isCredit ? (
                <ArrowUpRight className="w-3 h-3" strokeWidth={2.5} />
              ) : (
                <ArrowDownLeft className="w-3 h-3" strokeWidth={2.5} />
              )}
              <span className="text-[9px] font-medium">
                {isCredit ? "IN" : "OUT"}
              </span>
            </div>
          </div>

          {/* Actions Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => e.stopPropagation()}
                className={cn(
                  "h-7 w-7 rounded-md flex-shrink-0 transition-opacity",
                  "opacity-0 group-hover:opacity-100 focus:opacity-100",
                  "data-[state=open]:opacity-100"
                )}
                aria-label="Transaction actions"
              >
                <MoreVertical className="w-4 h-4 text-slate-500" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" sideOffset={4} className="w-44">
              <DropdownMenuItem
                onClick={handleEdit}
                className="cursor-pointer gap-2.5"
              >
                <Pencil className="w-3.5 h-3.5 text-slate-500" />
                <span>Edit</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={handleDelete}
                className="cursor-pointer gap-2.5 text-red-600 focus:text-red-700 focus:bg-red-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
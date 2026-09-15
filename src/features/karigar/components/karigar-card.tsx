"use client";

/**
 * Karigar Card — List Item
 * 
 * FEATURES:
 * - Avatar (photo or initials)
 * - Name + Phone
 * - Balance with direction (Cr/Dr)
 * - Transaction count
 * - Active/Inactive badge
 * - Hover actions (Edit, Delete)
 * - Click → Navigate to detail
 * 
 * STATES:
 * - Default
 * - Hover (actions visible)
 * - Active/Inactive
 * 
 * RESPONSIVE:
 * - Mobile: Stacked compact
 * - Desktop: Full info
 */

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Phone,
  MoreVertical,
  Pencil,
  Trash2,
  Receipt,
  Circle,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn, formatCurrency, getInitials } from "@/lib/utils";
import { formatPhone } from "@/utils/format-phone";
import { ROUTES } from "@/config/constants";
import type { KarigarWithBalance } from "../types";

// ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════

interface KarigarCardProps {
  karigar: KarigarWithBalance;
  onDelete?: (karigar: KarigarWithBalance) => void;
}

// ═══════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════

export function KarigarCard({ karigar, onDelete }: KarigarCardProps) {
  const router = useRouter();

  const initials = getInitials(karigar.name);
  const hasBalance = Math.abs(karigar.balance) > 0.01;
  const isCredit = karigar.balance > 0;

  const handleCardClick = () => {
    router.push(ROUTES.KARIGAR_DETAIL(karigar.id));
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(ROUTES.KARIGAR_EDIT(karigar.id));
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(karigar);
  };

  return (
    <div
      onClick={handleCardClick}
      className={cn(
        "group relative rounded-2xl bg-white border border-slate-200/60 p-4 transition-all duration-200 cursor-pointer",
        "hover:shadow-md hover:shadow-slate-900/5 hover:border-slate-300/60",
        !karigar.isActive && "opacity-60",
        !karigar.isActive && "bg-slate-50/50"
      )}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter") handleCardClick();
      }}
    >
      <div className="flex items-start gap-3">
        
        {/* ═══════════════════════════════════════════ */}
        {/* AVATAR */}
        {/* ═══════════════════════════════════════════ */}
        <div className="relative flex-shrink-0">
          <Avatar className="h-12 w-12 ring-2 ring-white shadow-sm">
            {karigar.photoUrl ? (
              <img
                src={karigar.photoUrl}
                alt={karigar.name}
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <AvatarFallback className="bg-slate-900 text-white text-sm font-semibold">
                {initials}
              </AvatarFallback>
            )}
          </Avatar>

          {/* Status Dot */}
          <span
            className={cn(
              "absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white",
              karigar.isActive ? "bg-emerald-500" : "bg-slate-400"
            )}
            title={karigar.isActive ? "Active" : "Inactive"}
          />
        </div>

        {/* ═══════════════════════════════════════════ */}
        {/* MAIN INFO */}
        {/* ═══════════════════════════════════════════ */}
        <div className="flex-1 min-w-0 space-y-1.5">
          
          {/* Name + Actions */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-slate-900 truncate">
                {karigar.name}
              </h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Phone className="w-3 h-3 text-slate-400 flex-shrink-0" />
                <p className="text-xs text-slate-500 truncate">
                  {formatPhone(karigar.phone)}
                </p>
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
                  aria-label="Karigar actions"
                >
                  <MoreVertical className="w-4 h-4 text-slate-500" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                sideOffset={4}
                className="w-44"
                onClick={(e) => e.stopPropagation()}
              >
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

          {/* Balance + Transactions */}
          <div className="flex items-center justify-between gap-2 pt-1">
            
            {/* Balance */}
            <div className="flex items-center gap-1.5">
              {hasBalance ? (
                <>
                  <span
                    className={cn(
                      "text-sm font-bold tabular-nums",
                      isCredit ? "text-emerald-600" : "text-amber-600"
                    )}
                  >
                    {formatCurrency(Math.abs(karigar.balance))}
                  </span>
                  <span
                    className={cn(
                      "text-[10px] font-semibold px-1.5 py-0.5 rounded",
                      isCredit
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-amber-50 text-amber-700"
                    )}
                  >
                    {isCredit ? "CR" : "DR"}
                  </span>
                </>
              ) : (
                <span className="text-xs font-medium text-slate-400">
                  Settled
                </span>
              )}
            </div>

            {/* Transaction Count */}
            <div className="flex items-center gap-1 text-[11px] text-slate-500">
              <Receipt className="w-3 h-3" />
              <span>{karigar.transactionCount}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
"use client";

/**
 * Transaction Type Selector — Premium Cards
 * 
 * FEATURES:
 * - 5 transaction type cards (grid layout)
 * - Icon + Label + Description per type
 * - Direction indicator (CREDIT / DEBIT)
 * - Selected state with ring + checkmark
 * - Hover effects
 * - Responsive (2 cols mobile, 3 cols desktop)
 * 
 * USAGE:
 *   <TransactionTypeSelector
 *     value={selectedType}
 *     onChange={(type) => setValue("type", type)}
 *   />
 */

import {
  Sparkles,
  Hammer,
  Wallet,
  TrendingUp,
  MinusCircle,
  Check,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  TransactionType,
  TransactionDirection,
} from "../types";

// ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════

interface TypeOption {
  value: TransactionType;
  label: string;
  description: string;
  direction: TransactionDirection;
  icon: LucideIcon;
  accent: "slate" | "blue" | "emerald" | "amber" | "rose";
}

interface TransactionTypeSelectorProps {
  value: TransactionType | null | undefined;
  onChange: (type: TransactionType) => void;
  disabled?: boolean;
}

// ═══════════════════════════════════════════════════════════
// TYPE OPTIONS
// ═══════════════════════════════════════════════════════════

const TYPE_OPTIONS: TypeOption[] = [
  {
    value: "OPENING_BALANCE",
    label: "Opening Balance",
    description: "Initial balance when karigar added",
    direction: "CREDIT",
    icon: Sparkles,
    accent: "slate",
  },
  {
    value: "WORK",
    label: "Work",
    description: "Work completed (we owe karigar)",
    direction: "CREDIT",
    icon: Hammer,
    accent: "emerald",
  },
  {
    value: "PAYMENT",
    label: "Payment",
    description: "Payment made to karigar",
    direction: "DEBIT",
    icon: Wallet,
    accent: "blue",
  },
  {
    value: "ADVANCE",
    label: "Advance",
    description: "Advance given before work",
    direction: "DEBIT",
    icon: TrendingUp,
    accent: "amber",
  },
  {
    value: "DEDUCTION",
    label: "Deduction",
    description: "Amount deducted from payment",
    direction: "DEBIT",
    icon: MinusCircle,
    accent: "rose",
  },
];

// ═══════════════════════════════════════════════════════════
// ACCENT STYLES
// ═══════════════════════════════════════════════════════════

const ACCENT_STYLES = {
  slate: {
    iconBg: "bg-slate-100 group-hover:bg-slate-900",
    iconColor: "text-slate-700 group-hover:text-white",
    selectedIconBg: "bg-slate-900",
    selectedIconColor: "text-white",
    ring: "ring-slate-900",
    badge: "bg-slate-100 text-slate-700",
    selectedBadge: "bg-slate-900 text-white",
  },
  emerald: {
    iconBg: "bg-emerald-50 group-hover:bg-emerald-600",
    iconColor: "text-emerald-600 group-hover:text-white",
    selectedIconBg: "bg-emerald-600",
    selectedIconColor: "text-white",
    ring: "ring-emerald-600",
    badge: "bg-emerald-50 text-emerald-700",
    selectedBadge: "bg-emerald-600 text-white",
  },
  blue: {
    iconBg: "bg-blue-50 group-hover:bg-blue-600",
    iconColor: "text-blue-600 group-hover:text-white",
    selectedIconBg: "bg-blue-600",
    selectedIconColor: "text-white",
    ring: "ring-blue-600",
    badge: "bg-blue-50 text-blue-700",
    selectedBadge: "bg-blue-600 text-white",
  },
  amber: {
    iconBg: "bg-amber-50 group-hover:bg-amber-500",
    iconColor: "text-amber-600 group-hover:text-white",
    selectedIconBg: "bg-amber-500",
    selectedIconColor: "text-white",
    ring: "ring-amber-500",
    badge: "bg-amber-50 text-amber-700",
    selectedBadge: "bg-amber-500 text-white",
  },
  rose: {
    iconBg: "bg-rose-50 group-hover:bg-rose-500",
    iconColor: "text-rose-600 group-hover:text-white",
    selectedIconBg: "bg-rose-500",
    selectedIconColor: "text-white",
    ring: "ring-rose-500",
    badge: "bg-rose-50 text-rose-700",
    selectedBadge: "bg-rose-500 text-white",
  },
} as const;

// ═══════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════

export function TransactionTypeSelector({
  value,
  onChange,
  disabled = false,
}: TransactionTypeSelectorProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
      {TYPE_OPTIONS.map((option) => {
        const isSelected = value === option.value;
        const Icon = option.icon;
        const styles = ACCENT_STYLES[option.accent];

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            disabled={disabled}
            className={cn(
              "relative text-left rounded-xl border-2 p-3.5 transition-all duration-200 group",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              isSelected
                ? cn(
                    "border-transparent bg-white shadow-sm ring-2",
                    styles.ring
                  )
                : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
            )}
          >
            <div className="flex items-start gap-3">
              {/* Icon */}
              <div
                className={cn(
                  "flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300",
                  isSelected ? styles.selectedIconBg : styles.iconBg
                )}
              >
                <Icon
                  className={cn(
                    "w-5 h-5 transition-colors duration-300",
                    isSelected ? styles.selectedIconColor : styles.iconColor
                  )}
                  strokeWidth={2.25}
                />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-semibold text-slate-900 truncate">
                    {option.label}
                  </p>
                </div>
                <p className="text-[11px] text-slate-500 leading-snug mt-0.5 line-clamp-2">
                  {option.description}
                </p>

                {/* Direction Badge */}
                <span
                  className={cn(
                    "inline-flex items-center gap-1 mt-2 px-1.5 py-0.5 rounded text-[10px] font-semibold",
                    isSelected ? styles.selectedBadge : styles.badge
                  )}
                >
                  {option.direction === "CREDIT" ? "↑" : "↓"}{" "}
                  {option.direction}
                </span>
              </div>

              {/* Checkmark (Selected Only) */}
              {isSelected && (
                <div
                  className={cn(
                    "flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center",
                    styles.selectedIconBg
                  )}
                >
                  <Check
                    className="w-3 h-3 text-white"
                    strokeWidth={3}
                  />
                </div>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
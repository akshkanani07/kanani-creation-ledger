"use client";

/**
 * Quick Actions — Dashboard Shortcuts
 * 
 * FEATURES:
 * - 4 primary actions (Add Karigar, Add Transaction, View Ledger, Reports)
 * - Grid layout (responsive: 2 cols mobile, 4 cols desktop)
 * - Icon + Label per action
 * - Hover effects (color-specific)
 * - Smooth animations
 * - Route navigation via next/navigation
 * 
 * WHY CLIENT COMPONENT:
 * - Uses useRouter for navigation
 * - Hover interactive states
 * - Active tap feedback (mobile)
 */

import { useRouter } from "next/navigation";
import {
  UserPlus,
  PlusCircle,
  BookOpen,
  FileText,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/config/constants";

// ═══════════════════════════════════════════════════════════
// ACTION CONFIG
// ═══════════════════════════════════════════════════════════

interface QuickAction {
  label: string;
  description: string;
  href: string;
  icon: LucideIcon;
  accent: "slate" | "blue" | "emerald" | "violet";
}

const ACTIONS: QuickAction[] = [
  {
    label: "Add Karigar",
    description: "Register new worker",
    href: ROUTES.KARIGAR_NEW,
    icon: UserPlus,
    accent: "slate",
  },
  {
    label: "Add Transaction",
    description: "Record work or payment",
    href: ROUTES.TRANSACTION_NEW,
    icon: PlusCircle,
    accent: "blue",
  },
  {
    label: "View Ledger",
    description: "Open running ledger",
    href: ROUTES.LEDGER,
    icon: BookOpen,
    accent: "emerald",
  },
  {
    label: "Reports",
    description: "Export PDF or Excel",
    href: ROUTES.REPORTS,
    icon: FileText,
    accent: "violet",
  },
];

// ═══════════════════════════════════════════════════════════
// ACCENT STYLES
// ═══════════════════════════════════════════════════════════

const ACCENT_STYLES = {
  slate: {
    iconBg: "bg-slate-100 group-hover:bg-slate-900",
    iconColor: "text-slate-700 group-hover:text-white",
    border: "group-hover:border-slate-900/20",
    arrow: "text-slate-400 group-hover:text-slate-900",
  },
  blue: {
    iconBg: "bg-blue-50 group-hover:bg-blue-600",
    iconColor: "text-blue-600 group-hover:text-white",
    border: "group-hover:border-blue-600/20",
    arrow: "text-slate-400 group-hover:text-blue-600",
  },
  emerald: {
    iconBg: "bg-emerald-50 group-hover:bg-emerald-600",
    iconColor: "text-emerald-600 group-hover:text-white",
    border: "group-hover:border-emerald-600/20",
    arrow: "text-slate-400 group-hover:text-emerald-600",
  },
  violet: {
    iconBg: "bg-violet-50 group-hover:bg-violet-600",
    iconColor: "text-violet-600 group-hover:text-white",
    border: "group-hover:border-violet-600/20",
    arrow: "text-slate-400 group-hover:text-violet-600",
  },
} as const;

// ═══════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════

export function QuickActions() {
  const router = useRouter();

  return (
    <section className="space-y-4">
      
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-900 tracking-tight">
            Quick Actions
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Common tasks and shortcuts
          </p>
        </div>
      </div>

      {/* Actions Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        {ACTIONS.map((action) => {
          const Icon = action.icon;
          const styles = ACCENT_STYLES[action.accent];

          return (
            <button
              key={action.href}
              onClick={() => router.push(action.href)}
              className={cn(
                "group relative overflow-hidden rounded-2xl bg-white border border-slate-200/60 p-4 lg:p-5 text-left transition-all duration-300",
                "hover:shadow-lg hover:shadow-slate-900/5 hover:-translate-y-0.5",
                "active:scale-[0.98]",
                styles.border
              )}
            >
              {/* Icon */}
              <div
                className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300",
                  styles.iconBg
                )}
              >
                <Icon
                  className={cn(
                    "w-5 h-5 transition-colors duration-300",
                    styles.iconColor
                  )}
                  strokeWidth={2.25}
                />
              </div>

              {/* Label */}
              <div className="mt-3 lg:mt-4 space-y-0.5">
                <p className="text-sm font-semibold text-slate-900 leading-tight">
                  {action.label}
                </p>
                <p className="text-[11px] text-slate-500 leading-snug line-clamp-2">
                  {action.description}
                </p>
              </div>

              {/* Arrow (bottom-right) */}
              <ArrowRight
                className={cn(
                  "absolute bottom-4 right-4 w-4 h-4 transition-all duration-300 group-hover:translate-x-0.5",
                  styles.arrow
                )}
                strokeWidth={2.25}
              />
            </button>
          );
        })}
      </div>
    </section>
  );
}
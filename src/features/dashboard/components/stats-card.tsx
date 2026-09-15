/**
 * Stats Card — Premium Metric Display
 * 
 * USED IN: Dashboard Home
 * 
 * FEATURES:
 * - Icon with colored accent background
 * - Large value display
 * - Label + description
 * - Hover elevation effect
 * - 4 accent colors: slate, amber, emerald, blue
 * - Responsive typography
 * 
 * DESIGN:
 * - Clean card with soft shadow
 * - Colored icon background (subtle)
 * - Value prominent (2xl)
 * - Description muted (xs)
 */

import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

// ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════

type AccentColor = "slate" | "amber" | "emerald" | "blue" | "violet" | "rose";

interface StatsCardProps {
  label: string;
  value: string;
  description?: string;
  icon: LucideIcon;
  accentColor?: AccentColor;
  /** Optional: Trend indicator (e.g., "+12%") */
  trend?: {
    value: string;
    isPositive: boolean;
  };
}

// ═══════════════════════════════════════════════════════════
// ACCENT COLOR MAP
// ═══════════════════════════════════════════════════════════

const ACCENT_STYLES: Record<
  AccentColor,
  {
    iconBg: string;
    iconColor: string;
    accentBar: string;
    ring: string;
  }
> = {
  slate: {
    iconBg: "bg-slate-100",
    iconColor: "text-slate-700",
    accentBar: "bg-slate-900",
    ring: "group-hover:ring-slate-200/60",
  },
  amber: {
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
    accentBar: "bg-amber-500",
    ring: "group-hover:ring-amber-200/60",
  },
  emerald: {
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
    accentBar: "bg-emerald-500",
    ring: "group-hover:ring-emerald-200/60",
  },
  blue: {
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
    accentBar: "bg-blue-500",
    ring: "group-hover:ring-blue-200/60",
  },
  violet: {
    iconBg: "bg-violet-50",
    iconColor: "text-violet-600",
    accentBar: "bg-violet-500",
    ring: "group-hover:ring-violet-200/60",
  },
  rose: {
    iconBg: "bg-rose-50",
    iconColor: "text-rose-600",
    accentBar: "bg-rose-500",
    ring: "group-hover:ring-rose-200/60",
  },
};

// ═══════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════

export function StatsCard({
  label,
  value,
  description,
  icon: Icon,
  accentColor = "slate",
  trend,
}: StatsCardProps) {
  const styles = ACCENT_STYLES[accentColor];

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl bg-white border border-slate-200/60 p-5 transition-all duration-300",
        "hover:shadow-lg hover:shadow-slate-900/5 hover:-translate-y-0.5",
        "ring-1 ring-transparent",
        styles.ring
      )}
    >
      {/* Accent Top Bar */}
      <div
        className={cn(
          "absolute top-0 left-0 right-0 h-0.5 transition-all duration-300 group-hover:h-1",
          styles.accentBar
        )}
      />

      {/* Content */}
      <div className="relative flex items-start justify-between gap-4">
        
        {/* Left: Label + Value + Description */}
        <div className="flex-1 min-w-0 space-y-2">
          
          {/* Label */}
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            {label}
          </p>

          {/* Value */}
          <p className="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight leading-none">
            {value}
          </p>

          {/* Description + Trend */}
          <div className="flex items-center gap-2 flex-wrap">
            {description && (
              <p className="text-xs text-slate-500">{description}</p>
            )}

            {trend && (
              <span
                className={cn(
                  "inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-semibold",
                  trend.isPositive
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-red-50 text-red-700"
                )}
              >
                {trend.isPositive ? "↑" : "↓"} {trend.value}
              </span>
            )}
          </div>
        </div>

        {/* Right: Icon */}
        <div
          className={cn(
            "flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-105",
            styles.iconBg
          )}
        >
          <Icon
            className={cn("w-5 h-5", styles.iconColor)}
            strokeWidth={2.25}
          />
        </div>
      </div>
    </div>
  );
}
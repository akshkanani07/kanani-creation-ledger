"use client";

/**
 * Mobile Navigation — Bottom Tab Bar
 * 
 * FEATURES:
 * - Fixed bottom navigation (mobile only)
 * - 5 primary navigation items
 * - Active state with icon + label
 * - Safe area inset (iPhone notch support)
 * - Glass morphism background
 * - Smooth tap animations
 * 
 * TABS:
 * Home | Karigar | + (Add) | Ledger | Reports
 * 
 * RESPONSIVE:
 * - Mobile & Tablet: Visible
 * - Desktop (lg+): Hidden (sidebar handles it)
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Plus,
  BookOpen,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/config/constants";

// ═══════════════════════════════════════════════════════════
// NAV ITEMS — 5 Tabs (with Center FAB)
// ═══════════════════════════════════════════════════════════

const NAV_ITEMS = [
  {
    label: "Home",
    href: ROUTES.DASHBOARD,
    icon: LayoutDashboard,
    exact: true,
  },
  {
    label: "Karigar",
    href: ROUTES.KARIGAR,
    icon: Users,
  },
  {
    // Center — Special "Add" button
    label: "Add",
    href: ROUTES.TRANSACTION_NEW,
    icon: Plus,
    primary: true,
  },
  {
    label: "Ledger",
    href: ROUTES.LEDGER,
    icon: BookOpen,
  },
  {
    label: "Reports",
    href: ROUTES.REPORTS,
    icon: FileText,
  },
] as const;

// ═══════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════

export function MobileNav() {
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <nav
      className="lg:hidden fixed bottom-0 inset-x-0 z-50 bg-white/95 backdrop-blur-xl border-t border-slate-200/80"
      style={{
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      <div className="grid grid-cols-5 h-16 max-w-lg mx-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href, item.exact);
          const isPrimary = "primary" in item && item.primary;

          // ═══════════════════════════════════════
          // PRIMARY BUTTON (Center FAB)
          // ═══════════════════════════════════════
          if (isPrimary) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative flex items-center justify-center"
                aria-label={item.label}
              >
                {/* Floating Button */}
                <div className="absolute -top-5 flex items-center justify-center">
                  <div className="relative">
                    {/* Glow */}
                    <div className="absolute inset-0 rounded-2xl bg-slate-900 blur-lg opacity-30" />
                    
                    {/* Button */}
                    <div
                      className={cn(
                        "relative w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl transition-all duration-300 active:scale-95",
                        active
                          ? "bg-slate-900 ring-4 ring-slate-900/10"
                          : "bg-slate-900 hover:bg-slate-800"
                      )}
                    >
                      <Icon
                        className="w-6 h-6 text-white"
                        strokeWidth={2.5}
                      />
                    </div>
                  </div>
                </div>

                {/* Label (Hidden — visual balance) */}
                <span className="invisible text-[10px]">Add</span>
              </Link>
            );
          }

          // ═══════════════════════════════════════
          // REGULAR TAB
          // ═══════════════════════════════════════
          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex flex-col items-center justify-center gap-0.5 group transition-transform duration-200 active:scale-95"
              aria-label={item.label}
            >
              {/* Active Indicator */}
              {active && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-b-full bg-slate-900" />
              )}

              {/* Icon */}
              <Icon
                className={cn(
                  "w-5 h-5 transition-colors duration-200",
                  active
                    ? "text-slate-900"
                    : "text-slate-400 group-hover:text-slate-600"
                )}
                strokeWidth={active ? 2.5 : 2}
              />

              {/* Label */}
              <span
                className={cn(
                  "text-[10px] font-medium transition-colors duration-200",
                  active
                    ? "text-slate-900"
                    : "text-slate-400 group-hover:text-slate-600"
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
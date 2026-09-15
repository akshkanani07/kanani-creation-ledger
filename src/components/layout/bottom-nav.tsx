"use client";

/**
 * Bottom Nav — Mobile Alternative (Minimal)
 * 
 * WHY THIS FILE EXISTS:
 * - `mobile-nav.tsx` — Full 5-tab navigation with FAB
 * - `bottom-nav.tsx` — Minimal version (for specific pages)
 * 
 * USE CASE:
 * - Detail pages (Karigar detail, Transaction detail)
 * - Form pages (New Karigar, Edit Transaction)
 * - Any page where full nav would be distracting
 * 
 * DIFFERENCE:
 * - mobile-nav: 5 tabs + center FAB
 * - bottom-nav: 3 tabs (Back, Home, Add) — context-aware
 * 
 * RESPONSIVE:
 * - Mobile only (lg:hidden)
 */

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { ArrowLeft, Home, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/config/constants";

// ═══════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════

interface BottomNavProps {
  /** Show Back button instead of Home */
  showBack?: boolean;
  /** Custom back URL (defaults to browser back) */
  backHref?: string;
  /** Show primary "Add" button */
  showAdd?: boolean;
  /** Custom Add URL */
  addHref?: string;
  /** Add button label */
  addLabel?: string;
}

export function BottomNav({
  showBack = false,
  backHref,
  showAdd = true,
  addHref = ROUTES.TRANSACTION_NEW,
  addLabel = "Add",
}: BottomNavProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleBack = () => {
    if (backHref) {
      router.push(backHref);
    } else {
      router.back();
    }
  };

  return (
    <nav
      className="lg:hidden fixed bottom-0 inset-x-0 z-50 bg-white/95 backdrop-blur-xl border-t border-slate-200/80"
      style={{
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      <div className="flex items-center justify-around h-16 max-w-md mx-auto px-4">
        
        {/* ═══════════════════════════════════════════ */}
        {/* BACK or HOME */}
        {/* ═══════════════════════════════════════════ */}
        {showBack ? (
          <button
            onClick={handleBack}
            className="flex flex-col items-center justify-center gap-0.5 group w-20 h-full transition-transform active:scale-95"
            aria-label="Go back"
          >
            <ArrowLeft
              className="w-5 h-5 text-slate-600 group-hover:text-slate-900 transition-colors"
              strokeWidth={2.5}
            />
            <span className="text-[10px] font-medium text-slate-600 group-hover:text-slate-900 transition-colors">
              Back
            </span>
          </button>
        ) : (
          <Link
            href={ROUTES.DASHBOARD}
            className="flex flex-col items-center justify-center gap-0.5 group w-20 h-full transition-transform active:scale-95"
            aria-label="Home"
          >
            <Home
              className={cn(
                "w-5 h-5 transition-colors",
                pathname === ROUTES.DASHBOARD
                  ? "text-slate-900"
                  : "text-slate-600 group-hover:text-slate-900"
              )}
              strokeWidth={pathname === ROUTES.DASHBOARD ? 2.5 : 2}
            />
            <span
              className={cn(
                "text-[10px] font-medium transition-colors",
                pathname === ROUTES.DASHBOARD
                  ? "text-slate-900"
                  : "text-slate-600 group-hover:text-slate-900"
              )}
            >
              Home
            </span>
          </Link>
        )}

        {/* ═══════════════════════════════════════════ */}
        {/* PRIMARY — Add Button */}
        {/* ═══════════════════════════════════════════ */}
        {showAdd && (
          <Link
            href={addHref}
            className="flex items-center gap-2 px-5 h-11 rounded-full bg-slate-900 text-white shadow-lg shadow-slate-900/20 transition-all duration-300 active:scale-95 hover:shadow-xl hover:shadow-slate-900/30"
            aria-label={addLabel}
          >
            <Plus className="w-4 h-4" strokeWidth={2.5} />
            <span className="text-sm font-semibold">{addLabel}</span>
          </Link>
        )}

        {/* ═══════════════════════════════════════════ */}
        {/* PLACEHOLDER (Balance layout) */}
        {/* ═══════════════════════════════════════════ */}
        {showBack && (
          <Link
            href={ROUTES.DASHBOARD}
            className="flex flex-col items-center justify-center gap-0.5 group w-20 h-full transition-transform active:scale-95"
            aria-label="Home"
          >
            <Home
              className="w-5 h-5 text-slate-600 group-hover:text-slate-900 transition-colors"
              strokeWidth={2}
            />
            <span className="text-[10px] font-medium text-slate-600 group-hover:text-slate-900 transition-colors">
              Home
            </span>
          </Link>
        )}

        {/* ═══════════════════════════════════════════ */}
        {/* EMPTY SPACER (when no back, no placeholder) */}
        {/* ═══════════════════════════════════════════ */}
        {!showBack && showAdd && (
          <div className="w-20" aria-hidden="true" />
        )}
      </div>
    </nav>
  );
}
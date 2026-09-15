"use client";

/**
 * App Sidebar — Desktop Navigation
 * 
 * FEATURES:
 * - Fixed left sidebar (256px wide)
 * - Master Logo at top
 * - Navigation links with icons
 * - Active route highlighting
 * - User card at bottom
 * - Premium spacing + Typography
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Receipt,
  BookOpen,
  FileText,
  Settings,
  Sparkles,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn, getInitials } from "@/lib/utils";
import { siteConfig } from "@/config/site";
import { ROUTES } from "@/config/constants";

// ═══════════════════════════════════════════════════════════
// NAVIGATION CONFIG
// ═══════════════════════════════════════════════════════════

const NAV_ITEMS = [
  {
    label: "Dashboard",
    href: ROUTES.DASHBOARD,
    icon: LayoutDashboard,
    exact: true,
  },
  {
    label: "Karigars",
    href: ROUTES.KARIGAR,
    icon: Users,
  },
  {
    label: "Transactions",
    href: ROUTES.TRANSACTIONS,
    icon: Receipt,
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
  {
    label: "Settings",
    href: ROUTES.SETTINGS,
    icon: Settings,
  },
] as const;

// ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════

interface AppSidebarProps {
  user: {
    name?: string | null;
    email: string;
  };
}

// ═══════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════

export function AppSidebar({ user }: AppSidebarProps) {
  const pathname = usePathname();
  const displayName = user.name || "Owner";
  const initials = getInitials(displayName);

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <aside className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 bg-white border-r border-slate-200/60 z-30">
      
      {/* ═══════════════════════════════════════════ */}
      {/* TOP — LOGO + BRAND */}
      {/* ═══════════════════════════════════════════ */}
      <div className="h-16 px-5 flex items-center border-b border-slate-200/60">
        <Link href={ROUTES.DASHBOARD} className="flex items-center gap-3 group">
          <div className="relative">
            <img
              src="/icons/logo.png"
              alt="Kanani Creation"
              className="w-9 h-9 rounded-lg shadow-sm transition-transform duration-300 group-hover:scale-105 object-cover"
            />
            {/* Status Dot */}
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white" />
          </div>

          <div>
            <p className="font-semibold text-slate-900 text-sm leading-tight tracking-tight">
              Kanani Creation
            </p>
            <p className="text-slate-500 text-[10px] tracking-wider uppercase font-medium">
              Ledger System
            </p>
          </div>
        </Link>
      </div>

      {/* ═══════════════════════════════════════════ */}
      {/* MIDDLE — NAVIGATION */}
      {/* ═══════════════════════════════════════════ */}
      <nav className="flex-1 overflow-y-auto px-3 py-5">
        
        {/* Section Label */}
        <p className="px-3 mb-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
          Menu
        </p>

        {/* Nav Items */}
        <ul className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href, item.exact);

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group",
                    active
                      ? "bg-slate-900 text-white shadow-sm shadow-slate-900/10"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  )}
                >
                  {active && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 rounded-r-full bg-slate-900" />
                  )}

                  <Icon
                    className={cn(
                      "w-[18px] h-[18px] transition-transform duration-200",
                      active
                        ? "text-white"
                        : "text-slate-500 group-hover:text-slate-700",
                      !active && "group-hover:scale-110"
                    )}
                  />

                  <span className="flex-1">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* ═══════════════════════════════════════════ */}
      {/* BOTTOM — USER CARD */}
      {/* ═══════════════════════════════════════════ */}
      <div className="p-3 border-t border-slate-200/60">
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 p-3 border border-slate-200/60">
          <div className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-full blur-2xl" />

          <div className="relative flex items-center gap-3">
            <Avatar className="h-9 w-9 ring-2 ring-white shadow-sm">
              <AvatarFallback className="bg-slate-900 text-white text-xs font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-semibold text-slate-900 truncate">
                  {displayName}
                </p>
                <Sparkles className="w-3 h-3 text-amber-500 flex-shrink-0" />
              </div>
              <p className="text-xs text-slate-500 truncate">{user.email}</p>
            </div>
          </div>
        </div>

        <p className="mt-3 text-center text-[10px] text-slate-400 tracking-wide">
          v{siteConfig.version} • © {new Date().getFullYear()}
        </p>
      </div>
    </aside>
  );
}
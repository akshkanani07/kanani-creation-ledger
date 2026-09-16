/**
 * Dashboard Home Page
 * 
 * LANDING PAGE for authenticated Owner.
 * 
 * SECTIONS:
 * 1. Welcome Header (Greeting + Date)
 * 2. Stats Grid (4 Cards: Karigars, Pending, Today, This Month)
 * 3. Quick Actions (Add Karigar, Add Transaction)
 * 4. Recent Transactions (Last 5)
 * 
 * DATA:
 * - Fetched via Server Action (get-dashboard-stats)
 * - Falls back to empty state if no data
 * 
 * WHY SERVER COMPONENT:
 * - SEO & Performance (no JS on client)
 * - Direct Prisma access (no API layer)
 * - Auto-refresh on navigation
 */

import { Suspense } from "react";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { getDashboardStats } from "@/features/dashboard/actions/get-dashboard-stats";
import { StatsCard } from "@/features/dashboard/components/stats-card";
import { QuickActions } from "@/features/dashboard/components/quick-actions";
import { RecentTransactions } from "@/features/dashboard/components/recent-transactions";
import { StatsSkeleton } from "@/features/dashboard/components/stats-skeleton";
import {
  Users,
  TrendingUp,
  Calendar,
  Wallet,
} from "lucide-react";

export const metadata = {
  title: "Dashboard | Kanani Creation Ledger",
  description: "Overview of your ledger",
};

export default async function DashboardPage() {
  // ═══════════════════════════════════════════
  // SESSION
  // ═══════════════════════════════════════════
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const userName = session?.user?.name || "Owner";

  // ═══════════════════════════════════════════
  // GREETING (Time-based)
  // 
  // MORNING   : 6:00 AM  → 11:59 AM  (Good morning)
  // AFTERNOON : 12:00 PM → 5:59 PM   (Good afternoon)
  // EVENING   : 6:00 PM  → 5:59 AM   (Good evening)
  // ═══════════════════════════════════════════
  const now = new Date();
  const hour = now.getHours();

  let greeting: string;
  if (hour >= 6 && hour < 12) {
    greeting = "Good morning";
  } else if (hour >= 12 && hour < 18) {
    greeting = "Good afternoon";
  } else {
    greeting = "Good evening";
  }

  const today = now.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-6 lg:space-y-8 max-w-7xl mx-auto">
      
      {/* ═══════════════════════════════════════════ */}
      {/* WELCOME HEADER */}
      {/* ═══════════════════════════════════════════ */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-[10px] font-semibold tracking-wide uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live Dashboard
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">
            {greeting}, {userName}
          </h1>
          <p className="text-sm text-slate-500">{today}</p>
        </div>
      </div>

      {/* ═══════════════════════════════════════════ */}
      {/* STATS GRID */}
      {/* ═══════════════════════════════════════════ */}
      <Suspense fallback={<StatsSkeleton />}>
        <DashboardStats />
      </Suspense>

      {/* ═══════════════════════════════════════════ */}
      {/* QUICK ACTIONS */}
      {/* ═══════════════════════════════════════════ */}
      <QuickActions />

      {/* ═══════════════════════════════════════════ */}
      {/* RECENT TRANSACTIONS */}
      {/* ═══════════════════════════════════════════ */}
      <Suspense
        fallback={
          <div className="h-80 bg-white rounded-2xl border border-slate-200/60 animate-pulse" />
        }
      >
        <RecentTransactions />
      </Suspense>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// STATS SUB-COMPONENT (Async Server Component)
// ═══════════════════════════════════════════════════════════

async function DashboardStats() {
  const result = await getDashboardStats();

  if (!result.success) {
    return (
      <div className="p-6 rounded-2xl bg-red-50 border border-red-100 text-center">
        <p className="text-sm text-red-700 font-medium">
          Failed to load stats. Please refresh.
        </p>
      </div>
    );
  }

  const stats = result.data;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatsCard
        label="Total Karigars"
        value={stats.totalKarigars.toString()}
        description={`${stats.activeKarigars} active`}
        icon={Users}
        accentColor="slate"
      />
      <StatsCard
        label="Pending Balance"
        value={formatCurrency(stats.totalPending)}
        description="To be paid"
        icon={Wallet}
        accentColor="amber"
      />
      <StatsCard
        label="Today's Work"
        value={formatCurrency(stats.todayWork)}
        description={`${stats.todayTransactions} entries`}
        icon={Calendar}
        accentColor="emerald"
      />
      <StatsCard
        label="This Month"
        value={formatCurrency(stats.monthWork)}
        description="Total work value"
        icon={TrendingUp}
        accentColor="blue"
      />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════

function formatCurrency(amount: number): string {
  return `₹${new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
  }).format(amount)}`;
}
/**
 * Dashboard Home Page — Premium UI
 * 
 * LANDING PAGE for authenticated Owner.
 * 
 * PREMIUM FEATURES:
 * - Gradient hero header with live indicator
 * - Enhanced stats grid with hover effects
 * - Time-based greeting (6AM-12PM / 12PM-6PM / 6PM-6AM)
 * - Glass morphism cards
 * - Smooth animations
 * - Mobile-first responsive design
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
  Sparkles,
  ArrowUpRight,
  Clock,
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
  let greetingEmoji: string;
  if (hour >= 6 && hour < 12) {
    greeting = "Good morning";
    greetingEmoji = "☀️";
  } else if (hour >= 12 && hour < 18) {
    greeting = "Good afternoon";
    greetingEmoji = "🌤️";
  } else {
    greeting = "Good evening";
    greetingEmoji = "🌙";
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
      {/* PREMIUM WELCOME HEADER */}
      {/* ═══════════════════════════════════════════ */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 lg:p-8 shadow-2xl shadow-slate-900/20">
        
        {/* Decorative gradient blobs */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/20 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-emerald-500/10 to-transparent rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        
        {/* Grid pattern overlay */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
            backgroundSize: '32px 32px',
          }}
        />

        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            {/* Live indicator */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
              </span>
              <span className="text-[10px] font-semibold text-white/90 tracking-wider uppercase">
                Live Dashboard
              </span>
            </div>

            {/* Greeting */}
            <h1 className="text-2xl lg:text-4xl font-bold text-white tracking-tight">
              {greetingEmoji} {greeting},{" "}
              <span className="bg-gradient-to-r from-blue-300 to-emerald-300 bg-clip-text text-transparent">
                {userName}
              </span>
            </h1>

            {/* Date */}
            <div className="flex items-center gap-2 text-slate-300/90">
              <Clock className="w-3.5 h-3.5" />
              <p className="text-sm">{today}</p>
            </div>
          </div>

          {/* Right side: Sparkle badge */}
          <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span className="text-xs font-semibold text-white/90">
              Everything in sync
            </span>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════ */}
      {/* STATS GRID */}
      {/* ═══════════════════════════════════════════ */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Overview
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Your business at a glance
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-1 text-xs text-slate-400">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Updated live</span>
          </div>
        </div>

        <Suspense fallback={<StatsSkeleton />}>
          <DashboardStats />
        </Suspense>
      </div>

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
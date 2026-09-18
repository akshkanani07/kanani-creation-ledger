/**
 * Dashboard Home Page — Premium UI/UX
 * 
 * LANDING PAGE for authenticated Owner.
 * 
 * PREMIUM FEATURES:
 * - Gradient hero with animated mesh
 * - Live ping indicator
 * - IST timezone-aware greeting
 * - Glass morphism cards
 * - Smooth micro-interactions
 * - Mobile-first responsive
 * 
 * DATA:
 * - Fetched via Server Action (get-dashboard-stats)
 * - Suspense boundaries for streaming
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
  // IST TIMEZONE-AWARE GREETING
  // 
  // MORNING   : 6:00 AM  → 11:59 AM  (Good morning)
  // AFTERNOON : 12:00 PM → 5:59 PM   (Good afternoon)
  // EVENING   : 6:00 PM  → 5:59 AM   (Good evening)
  // ═══════════════════════════════════════════
  const now = new Date();

  // ✅ Convert to IST properly
  const istParts = new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "numeric",
    hour12: false,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).formatToParts(now);

  const getPart = (type: string) =>
    istParts.find((p) => p.type === type)?.value ?? "";

  const hour = parseInt(getPart("hour"), 10);

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

  const today = `${getPart("weekday")}, ${getPart("day")} ${getPart(
    "month"
  )} ${getPart("year")}`;

  return (
    <div className="space-y-6 lg:space-y-8 max-w-7xl mx-auto">
      
      {/* ═══════════════════════════════════════════ */}
      {/* PREMIUM HERO HEADER */}
      {/* ═══════════════════════════════════════════ */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 lg:p-10 shadow-2xl shadow-slate-900/30 border border-slate-800/50">
        
        {/* Animated gradient blobs */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-blue-500/30 via-indigo-500/20 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 animate-pulse" 
             style={{ animationDuration: '4s' }} />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-emerald-500/20 via-teal-500/10 to-transparent rounded-full blur-3xl translate-y-1/2 -translate-x-1/3 animate-pulse" 
             style={{ animationDuration: '6s' }} />
        
        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />

        {/* Radial highlight */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.1),transparent_50%)]" />

        <div className="relative flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
          <div className="space-y-4">
            {/* Live indicator */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.08] backdrop-blur-md border border-white/10">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
              </span>
              <span className="text-[10px] font-bold text-white/90 tracking-[0.15em] uppercase">
                Live Dashboard
              </span>
            </div>

            {/* Greeting */}
            <div className="space-y-2">
              <h1 className="text-2xl lg:text-4xl font-bold text-white tracking-tight leading-tight">
                <span className="mr-2">{greetingEmoji}</span>
                {greeting},{" "}
                <span className="bg-gradient-to-r from-blue-300 via-cyan-300 to-emerald-300 bg-clip-text text-transparent">
                  {userName}
                </span>
              </h1>

              {/* Date with clock icon */}
              <div className="flex items-center gap-2 text-slate-400">
                <div className="flex items-center justify-center w-5 h-5 rounded-full bg-white/[0.06] border border-white/10">
                  <Clock className="w-2.5 h-2.5" />
                </div>
                <p className="text-xs font-medium tracking-wide">{today}</p>
              </div>
            </div>
          </div>

          {/* Right side badge */}
          <div className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/[0.04] backdrop-blur-md border border-white/10 shadow-lg shadow-black/5">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span className="text-xs font-semibold text-white/90 whitespace-nowrap">
              Everything in sync
            </span>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════ */}
      {/* STATS SECTION */}
      {/* ═══════════════════════════════════════════ */}
      <section>
        <div className="flex items-end justify-between mb-5">
          <div className="space-y-0.5">
            <h2 className="text-lg lg:text-xl font-bold text-slate-900 tracking-tight">
              Overview
            </h2>
            <p className="text-xs text-slate-500">
              Your business at a glance
            </p>
          </div>

          <div className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
            </span>
            Updated live
          </div>
        </div>

        <Suspense fallback={<StatsSkeleton />}>
          <DashboardStats />
        </Suspense>
      </section>

      {/* ═══════════════════════════════════════════ */}
      {/* QUICK ACTIONS */}
      {/* ═══════════════════════════════════════════ */}
      <QuickActions />

      {/* ═══════════════════════════════════════════ */}
      {/* RECENT TRANSACTIONS */}
      {/* ═══════════════════════════════════════════ */}
      <Suspense
        fallback={
          <div className="h-80 bg-white rounded-3xl border border-slate-200/60 animate-pulse" />
        }
      >
        <RecentTransactions />
      </Suspense>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// STATS SUB-COMPONENT
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
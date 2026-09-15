/**
 * Stats Skeleton — Loading Placeholder
 * 
 * Shown while `getDashboardStats()` is fetching.
 * Matches StatsCard layout exactly to prevent layout shift.
 * 
 * WHY SKELETON (not spinner):
 * - Better UX (perceived performance)
 * - No layout shift (CLS = 0)
 * - Preview of content structure
 * 
 * DESIGN:
 * - 4 cards (matches dashboard grid)
 * - Pulse animation
 * - Same height/padding as StatsCard
 */

export function StatsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className="relative overflow-hidden rounded-2xl bg-white border border-slate-200/60 p-5"
        >
          {/* Accent Bar */}
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-slate-200" />

          <div className="relative flex items-start justify-between gap-4">
            {/* Left — Content */}
            <div className="flex-1 min-w-0 space-y-3">
              {/* Label */}
              <div className="h-2.5 w-24 rounded bg-slate-200 animate-pulse" />

              {/* Value */}
              <div className="h-7 w-20 rounded bg-slate-200 animate-pulse" />

              {/* Description */}
              <div className="h-2 w-16 rounded bg-slate-100 animate-pulse" />
            </div>

            {/* Right — Icon */}
            <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-slate-100 animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}
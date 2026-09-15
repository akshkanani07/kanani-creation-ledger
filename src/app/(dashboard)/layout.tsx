/**
 * Dashboard Layout — Protected Shell
 * 
 * AUTHENTICATED AREA — All routes here require a valid session.
 * 
 * STRUCTURE:
 * ┌─────────────────────────────────────────────┐
 * │  Header (Top Bar)                           │
 * ├──────────┬──────────────────────────────────┤
 * │          │                                  │
 * │ Sidebar  │  Main Content (children)         │
 * │ (Desktop)│                                  │
 * │          │                                  │
 * ├──────────┴──────────────────────────────────┤
 * │  Bottom Nav (Mobile Only)                   │
 * └─────────────────────────────────────────────┘
 * 
 * AUTH CHECK:
 * - Server-side session verification (fast)
 * - Redirect to /login if no session
 * - Cookie cache (5min) prevents DB hit on every nav
 */

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { AppHeader } from "@/components/layout/app-header";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // ═══════════════════════════════════════════
  // SERVER-SIDE AUTH CHECK
  // ═══════════════════════════════════════════
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  // ═══════════════════════════════════════════
  // RENDER PROTECTED SHELL
  // ═══════════════════════════════════════════
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Desktop Sidebar */}
      <AppSidebar user={session.user} />

      {/* Main Content Area */}
      <div className="lg:pl-64">
        {/* Top Header */}
        <AppHeader user={session.user} />

        {/* Page Content */}
        <main className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8 pb-24 lg:pb-8">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <MobileNav />
    </div>
  );
}
"use client";

/**
 * App Header — Sticky Top Bar
 * 
 * FEATURES:
 * - Sticky positioning
 * - Mobile logo (Master Logo Image)
 * - Real search (navigates to /karigar?search=...)
 * - User menu (Settings, Sign out)
 * - NO notification bell
 * - NO profile link
 * 
 * RESPONSIVE:
 * - Mobile: Logo + User Menu only
 * - Desktop: Page context + Search + User Menu
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Settings, ChevronDown, Search } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { authClient } from "@/lib/auth-client";
import { ROUTES } from "@/config/constants";

// ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════

interface AppHeaderProps {
  user: {
    name?: string | null;
    email: string;
    image?: string | null;
  };
}

// ═══════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════

export function AppHeader({ user }: AppHeaderProps) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const displayName = user.name || "Owner";
  const initials = getInitials(displayName);

  // ═══════════════════════════════════════════
  // LOGOUT
  // ═══════════════════════════════════════════
  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await authClient.signOut();
      router.push(ROUTES.LOGIN);
      router.refresh();
    } catch (error) {
      console.error("Logout failed:", error);
      setIsLoggingOut(false);
    }
  };

  // ═══════════════════════════════════════════
  // SEARCH — Navigate to Karigars with Query
  // ═══════════════════════════════════════════
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    const query = searchQuery.trim();
    if (!query) return;

    router.push(`/karigar?search=${encodeURIComponent(query)}`);
    setSearchQuery("");
  };

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200/60">
      <div className="h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        
        {/* ═══════════════════════════════════════════ */}
        {/* LEFT — Mobile Logo */}
        {/* ═══════════════════════════════════════════ */}
        <div className="flex items-center gap-3">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-2.5">
            <img
              src="/icons/logo.png"
              alt="Kanani Creation"
              className="w-9 h-9 rounded-lg shadow-sm object-cover"
            />
            <div className="hidden xs:block">
              <p className="font-semibold text-slate-900 text-sm leading-tight">
                Kanani Creation
              </p>
              <p className="text-slate-500 text-[10px] tracking-wide uppercase font-medium">
                Ledger
              </p>
            </div>
          </div>

          {/* Desktop Page Title */}
          <div className="hidden lg:block">
            <h1 className="font-semibold text-slate-900 text-base tracking-tight">
              Dashboard
            </h1>
            <p className="text-slate-500 text-xs">
              Welcome back, {displayName}
            </p>
          </div>
        </div>

        {/* ═══════════════════════════════════════════ */}
        {/* CENTER — Real Search (Desktop) */}
        {/* ═══════════════════════════════════════════ */}
        <form
          onSubmit={handleSearch}
          className="hidden md:flex flex-1 max-w-md"
        >
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search karigars by name or phone..."
              className="w-full h-10 pl-10 pr-4 rounded-xl bg-slate-100 border border-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900/5 transition-all"
            />
          </div>
        </form>

        {/* ═══════════════════════════════════════════ */}
        {/* RIGHT — User Menu Only */}
        {/* ═══════════════════════════════════════════ */}
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="flex items-center gap-2 h-9 pl-1 pr-2 rounded-lg hover:bg-slate-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/10"
                aria-label="User menu"
              >
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="bg-slate-900 text-white text-[11px] font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <ChevronDown className="hidden sm:block w-3.5 h-3.5 text-slate-500" />
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              sideOffset={8}
              className="w-64 p-1.5"
            >
              {/* User Info */}
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-50">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-slate-900 text-white text-xs font-semibold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">
                      {displayName}
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      {user.email}
                    </p>
                  </div>
                </div>
              </DropdownMenuLabel>

              <DropdownMenuSeparator className="my-1.5" />

              {/* Settings Only */}
              <DropdownMenuItem
                onClick={() => router.push(ROUTES.SETTINGS)}
                className="cursor-pointer gap-2.5 py-2"
              >
                <Settings className="w-4 h-4 text-slate-500" />
                <span>Settings</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator className="my-1.5" />

              {/* Logout */}
              <DropdownMenuItem
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="cursor-pointer gap-2.5 py-2 text-red-600 focus:text-red-700 focus:bg-red-50"
              >
                <LogOut className="w-4 h-4" />
                <span>{isLoggingOut ? "Signing out..." : "Sign out"}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
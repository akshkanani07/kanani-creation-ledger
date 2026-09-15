/**
 * Auth Layout — Ultra Premium Split-Screen
 * 
 * FEATURES:
 * - Animated gradient background
 * - Floating glow orbs
 * - Grid pattern overlay
 * - Master Logo (Desktop + Mobile)
 * - Staggered feature list
 * - Version badge
 * - Fully responsive
 */

import { siteConfig } from "@/config/site";
import { CheckCircle2, Sparkles, Shield } from "lucide-react";

const FEATURES = [
  { text: "Complete karigar ledger tracking", delay: "400ms" },
  { text: "Unified transactions — work, payment, advance", delay: "500ms" },
  { text: "PDF reports & WhatsApp sharing", delay: "600ms" },
  { text: "Secure magic-link authentication", delay: "700ms" },
];

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      
      {/* ═══════════════════════════════════════════════════════ */}
      {/* LEFT PANEL — Branding (Desktop) */}
      {/* ═══════════════════════════════════════════════════════ */}
      <aside className="hidden lg:flex lg:w-[55%] xl:w-[58%] relative overflow-hidden bg-slate-950">
        
        {/* LAYER 1: Base Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950" />

        {/* LAYER 2: Animated Mesh */}
        <div className="absolute inset-0 auth-mesh" />

        {/* LAYER 3: Grid Pattern */}
        <div className="absolute inset-0 auth-grid opacity-[0.04]" />

        {/* LAYER 4: Floating Orbs */}
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-blue-500/25 rounded-full blur-3xl auth-orb-1" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-indigo-500/25 rounded-full blur-3xl auth-orb-2" />
        <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-violet-500/15 rounded-full blur-3xl auth-orb-3" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-10 xl:p-14 w-full">
          
          {/* ═══════════════════════════════════════════ */}
          {/* Top — Master Logo */}
          {/* ═══════════════════════════════════════════ */}
          <div className="flex items-center gap-3 auth-stagger-1">
            <div className="relative">
              <div className="absolute inset-0 bg-white rounded-xl blur-lg opacity-20 auth-logo-glow" />
              <img
                src="/icons/logo.png"
                alt="Kanani Creation"
                className="relative w-11 h-11 rounded-xl shadow-2xl shadow-black/30 object-cover"
              />
            </div>
            <div>
              <h1 className="text-white font-semibold text-base leading-tight">
                {siteConfig.company.name}
              </h1>
              <p className="text-slate-400 text-xs">
                {siteConfig.company.industry}
              </p>
            </div>
          </div>

          {/* ═══════════════════════════════════════════ */}
          {/* Middle — Hero + Features + Stats */}
          {/* ═══════════════════════════════════════════ */}
          <div className="space-y-8 max-w-lg">
            
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md auth-stagger-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span className="text-xs text-slate-300 font-medium tracking-wide">
                Enterprise Ledger System
              </span>
            </div>

            {/* Heading */}
            <div className="space-y-4 auth-stagger-2">
              <h2 className="text-4xl xl:text-5xl font-bold text-white leading-[1.05] tracking-tight">
                Your ledger,
                <br />
                <span className="bg-gradient-to-r from-slate-400 via-slate-300 to-slate-500 bg-clip-text text-transparent">
                  simplified.
                </span>
              </h2>
              <p className="text-slate-300 text-base xl:text-lg leading-relaxed">
                Track karigar accounts, transactions, and payments — all in one
                secure, mobile-first system.
              </p>
            </div>

            {/* Feature List */}
            <ul className="space-y-3 auth-stagger-3">
              {FEATURES.map((feature, i) => (
                <li
                  key={feature.text}
                  className="flex items-start gap-3 text-slate-300 auth-feature-item"
                  style={{ animationDelay: feature.delay }}
                >
                  <div className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  </div>
                  <span className="text-sm leading-relaxed">{feature.text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* ═══════════════════════════════════════════ */}
          {/* Bottom — Meta */}
          {/* ═══════════════════════════════════════════ */}
          <div className="flex items-center justify-between auth-stagger-3">
            <p className="text-slate-500 text-xs">
              © {new Date().getFullYear()} {siteConfig.company.name}
            </p>
            <div className="flex items-center gap-2">
              {/* LIVE Badge */}
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-emerald-400 text-[10px] font-medium tracking-wide">
                  LIVE
                </span>
              </div>
              {/* SECURE Badge */}
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20">
                <Shield className="w-3 h-3 text-blue-400" />
                <span className="text-blue-400 text-[10px] font-medium tracking-wide">
                  SECURE
                </span>
              </div>
              {/* Version */}
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                <span className="text-slate-400 text-[10px] font-medium tracking-wide">
                  v{siteConfig.version}
                </span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* RIGHT PANEL — Auth Form */}
      {/* ═══════════════════════════════════════════════════════ */}
      <main className="flex-1 lg:w-[45%] xl:w-[42%] relative bg-slate-950 lg:bg-white overflow-hidden">
        
        {/* Mobile: Dark Background Decorations */}
        <div className="lg:hidden absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950" />
        <div className="lg:hidden absolute inset-0 auth-mesh" />
        <div className="lg:hidden absolute inset-0 auth-grid opacity-[0.04]" />
        <div className="lg:hidden absolute -top-40 -right-40 w-[400px] h-[400px] bg-blue-500/25 rounded-full blur-3xl auth-orb-1" />
        <div className="lg:hidden absolute -bottom-40 -left-40 w-[400px] h-[400px] bg-indigo-500/25 rounded-full blur-3xl auth-orb-2" />

        {/* Desktop: Subtle Background Decorations */}
        <div className="hidden lg:block absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-slate-50 via-slate-50/50 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="hidden lg:block absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-slate-50 via-slate-50/30 to-transparent rounded-full blur-3xl pointer-events-none" />

        {/* ═══════════════════════════════════════════ */}
        {/* Mobile Header — Master Logo */}
        {/* ═══════════════════════════════════════════ */}
        <header className="lg:hidden relative z-10 border-b border-white/10">
          <div className="px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src="/icons/logo.png"
                alt="Kanani Creation"
                className="w-9 h-9 rounded-lg shadow-lg object-cover"
              />
              <div>
                <p className="font-semibold text-white text-sm leading-tight">
                  {siteConfig.company.name}
                </p>
                <p className="text-slate-400 text-xs">Ledger System</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-400 text-[10px] font-medium">
                Online
              </span>
            </div>
          </div>
        </header>

        {/* ═══════════════════════════════════════════ */}
        {/* Form Area */}
        {/* ═══════════════════════════════════════════ */}
        <div className="relative z-10 flex-1 flex items-center justify-center p-6 lg:p-12 min-h-[calc(100vh-4rem)] lg:min-h-screen">
          <div className="w-full max-w-md lg:max-w-[400px]">{children}</div>
        </div>

        {/* Mobile Footer */}
        <footer className="lg:hidden relative z-10 py-4 text-center text-xs text-slate-500 px-6">
          © {new Date().getFullYear()} {siteConfig.company.name}
        </footer>
      </main>
    </div>
  );
}
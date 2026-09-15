/**
 * Login Page — Premium Design
 * 
 * After clicking "Send Magic Link":
 * - Email sent to CURRENT owner email (from DB)
 * - User clicks link in email
 * - Session created
 * - Auto-redirect to /dashboard
 */

import { LoginForm } from "@/features/auth/components/login-form";
import { siteConfig } from "@/config/site";
import { ShieldCheck, Lock, Zap } from "lucide-react";

export const metadata = {
  title: `Sign In | ${siteConfig.name}`,
  description: "Sign in to access your ledger dashboard",
};

export default function LoginPage() {
  return (
    <div className="space-y-8 auth-page-in">
      {/* Header */}
      <div className="space-y-5">
        {/* Trust Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200/60">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Secure Sign In
          </div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-100">
            <Lock className="w-3 h-3" />
            256-bit
          </div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-medium border border-blue-100">
            <Zap className="w-3 h-3" />
            5 sec
          </div>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight leading-tight">
            Welcome back
          </h1>
          <p className="text-slate-500 text-base leading-relaxed">
            Sign in to access your ledger dashboard
          </p>
        </div>
      </div>

      {/* Form */}
      <LoginForm />

      {/* Footer Note */}
      <div className="pt-6 border-t border-slate-100">
        <p className="text-xs text-slate-400 text-center leading-relaxed">
          By signing in, you agree to our{" "}
          <a
            href="#"
            className="text-slate-600 hover:text-slate-900 underline-offset-2 hover:underline transition-colors font-medium"
          >
            Terms
          </a>{" "}
          and{" "}
          <a
            href="#"
            className="text-slate-600 hover:text-slate-900 underline-offset-2 hover:underline transition-colors font-medium"
          >
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  );
}
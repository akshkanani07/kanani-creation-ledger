"use client";

/**
 * Login Form — Ultra Premium v3
 * 
 * FLOW:
 * 1. User clicks "Send Magic Link"
 * 2. Server Action sends to CURRENT DB email
 * 3. Success state shows
 * 4. User clicks link in email
 * 5. Auto-redirect to /dashboard
 */

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Mail,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  RefreshCw,
  Inbox,
  Lock,
  Sparkles,
  Clock,
} from "lucide-react";
import { sendMagicLink } from "@/features/auth/actions/send-magic-link";

type FormState = "idle" | "sent" | "error";

export function LoginForm() {
  const [state, setState] = useState<FormState>("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isPending, startTransition] = useTransition();

  const handleSendMagicLink = () => {
    setErrorMessage("");
    startTransition(async () => {
      const result = await sendMagicLink();
      if (result.success) {
        setState("sent");
      } else {
        setState("error");
        setErrorMessage(result.error);
      }
    });
  };

  // ═══════════════════════════════════════════
  // SUCCESS STATE
  // ═══════════════════════════════════════════
  if (state === "sent") {
    return (
      <div className="space-y-6 auth-state-in">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/30 via-emerald-500/20 to-emerald-600/10 rounded-2xl blur-2xl" />
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-300/20 to-transparent rounded-2xl blur-3xl" />

          <div className="relative flex flex-col items-center text-center space-y-4 p-7 rounded-2xl bg-gradient-to-br from-emerald-50/95 to-emerald-50/50 border border-emerald-100/80 backdrop-blur-sm">
            <div className="relative">
              <div className="absolute inset-0 bg-emerald-300 rounded-full blur-2xl opacity-70 auth-icon-pulse" />
              <div className="relative w-16 h-16 rounded-full bg-white border-2 border-emerald-100 flex items-center justify-center shadow-xl shadow-emerald-500/20">
                <CheckCircle2
                  className="w-8 h-8 text-emerald-600"
                  strokeWidth={2.5}
                />
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-slate-900 text-lg">
                Check your email
              </h3>
              <p className="text-sm text-slate-600 max-w-xs leading-relaxed">
                We&apos;ve sent a secure sign-in link to your registered email.
                Click the link to sign in.
              </p>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-medium border border-amber-100">
                <Clock className="w-3 h-3" />
                Expires in 10 minutes
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-50/80 border border-slate-100 text-xs text-slate-500">
          <Inbox className="w-3.5 h-3.5" />
          <span>Didn&apos;t receive it? Check your spam folder</span>
        </div>

        <Button
          variant="outline"
          onClick={handleSendMagicLink}
          disabled={isPending}
          className="w-full h-11 group border-slate-200 hover:border-slate-300 hover:bg-slate-50"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Resending...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4 mr-2 transition-transform duration-500 group-hover:rotate-180" />
              Resend Magic Link
            </>
          )}
        </Button>
      </div>
    );
  }

  // ═══════════════════════════════════════════
  // ERROR STATE
  // ═══════════════════════════════════════════
  if (state === "error") {
    return (
      <div className="space-y-6 auth-state-in auth-shake">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-red-400/30 via-red-500/20 to-red-600/10 rounded-2xl blur-2xl" />
          <div className="absolute inset-0 bg-gradient-to-br from-red-300/20 to-transparent rounded-2xl blur-3xl" />

          <div className="relative flex flex-col items-center text-center space-y-4 p-7 rounded-2xl bg-gradient-to-br from-red-50/95 to-red-50/50 border border-red-100/80 backdrop-blur-sm">
            <div className="relative">
              <div className="absolute inset-0 bg-red-300 rounded-full blur-2xl opacity-70 auth-icon-pulse" />
              <div className="relative w-16 h-16 rounded-full bg-white border-2 border-red-100 flex items-center justify-center shadow-xl shadow-red-500/20">
                <AlertCircle
                  className="w-8 h-8 text-red-600"
                  strokeWidth={2.5}
                />
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-slate-900 text-lg">
                Something went wrong
              </h3>
              <p className="text-sm text-slate-600 max-w-xs leading-relaxed">
                {errorMessage ||
                  "Could not send the magic link. Please try again."}
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => setState("idle")}
            className="flex-1 h-11"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSendMagicLink}
            disabled={isPending}
            className="flex-1 h-11 bg-slate-900 hover:bg-slate-800"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Retrying...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Try again
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════
  // IDLE STATE
  // ═══════════════════════════════════════════
  return (
    <div className="space-y-6 auth-state-in">
      {/* Info Box */}
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-200/50 to-slate-100/30 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="relative p-4 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100/50 border border-slate-200/60 transition-all duration-300 group-hover:border-slate-300/60">
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center shadow-sm transition-transform duration-300 group-hover:scale-105">
              <Mail className="w-4 h-4 text-slate-700" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
                Passwordless sign-in
                <Sparkles className="w-3 h-3 text-amber-500" />
              </p>
              <p className="text-xs text-slate-500 leading-relaxed">
                We&apos;ll email a secure sign-in link to your registered
                address. No password needed.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Button */}
      <Button
        onClick={handleSendMagicLink}
        disabled={isPending}
        size="lg"
        className="relative w-full h-12 text-[15px] font-semibold group overflow-hidden bg-slate-900 hover:bg-slate-800 transition-all duration-300 shadow-lg shadow-slate-900/10 hover:shadow-2xl hover:shadow-slate-900/25 hover:-translate-y-0.5 disabled:hover:translate-y-0"
      >
        <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1),transparent_70%)]" />

        <span className="relative flex items-center justify-center">
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Sending magic link...
            </>
          ) : (
            <>
              <Mail className="w-4 h-4 mr-2" />
              Send Magic Link
              <ArrowRight className="w-4 h-4 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
            </>
          )}
        </span>
      </Button>

      {/* Security Footer */}
      <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
        <Lock className="w-3.5 h-3.5" />
        <span>End-to-end encrypted</span>
        <span className="w-1 h-1 rounded-full bg-slate-300" />
        <span>Only owner can sign in</span>
      </div>
    </div>
  );
}
"use client";

/**
 * Verify Email Client — UI for Verification States
 * 
 * 3 STATES:
 * - success: Email verified, show new email, auto-redirect
 * - error: Verification failed (expired, invalid)
 * - invalid: Missing params
 * - loading: While verifying
 */

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2,
  AlertCircle,
  XCircle,
  Loader2,
  ArrowRight,
  Mail,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/config/constants";

// ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════

type Status = "success" | "error" | "invalid" | "loading";

interface VerifyEmailClientProps {
  status: Status;
  newEmail?: string;
  errorMessage?: string;
}

// ═══════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════

export function VerifyEmailClient({
  status,
  newEmail,
  errorMessage,
}: VerifyEmailClientProps) {
  const router = useRouter();

  // Auto-redirect on success
  useEffect(() => {
    if (status === "success") {
      const timer = setTimeout(() => {
        router.push(ROUTES.SETTINGS);
        router.refresh();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [status, router]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        
        {/* ═══════════════════════════════════════════ */}
        {/* SUCCESS */}
        {/* ═══════════════════════════════════════════ */}
        {status === "success" && (
          <div className="rounded-2xl bg-white border border-slate-200/60 p-8 text-center space-y-5">
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-emerald-400 rounded-full blur-2xl opacity-40 animate-pulse" />
                <div className="relative w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
                  <CheckCircle2
                    className="w-8 h-8 text-emerald-600"
                    strokeWidth={2.5}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Email verified! 🎉
              </h1>
              <p className="text-sm text-slate-500 leading-relaxed">
                Your email has been successfully changed to
              </p>
              {newEmail && (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 max-w-full">
                  <Mail className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                  <p className="text-xs font-semibold text-slate-900 truncate">
                    {newEmail}
                  </p>
                </div>
              )}
            </div>

            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-100">
              <p className="text-[11px] text-emerald-800 leading-relaxed">
                <strong>All your data is safe.</strong> Next time you sign in,
                use your new email address.
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <Button
                asChild
                className="w-full h-11 rounded-xl bg-slate-900 hover:bg-slate-800"
              >
                <Link href={ROUTES.SETTINGS}>
                  <Settings className="w-4 h-4 mr-2" />
                  Go to Settings
                </Link>
              </Button>

              <p className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" />
                Auto-redirecting in 5 seconds...
              </p>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════ */}
        {/* ERROR */}
        {/* ═══════════════════════════════════════════ */}
        {status === "error" && (
          <div className="rounded-2xl bg-white border border-slate-200/60 p-8 text-center space-y-5">
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-red-400 rounded-full blur-2xl opacity-40 animate-pulse" />
                <div className="relative w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertCircle
                    className="w-8 h-8 text-red-600"
                    strokeWidth={2.5}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Verification failed
              </h1>
              <p className="text-sm text-slate-500 leading-relaxed">
                {errorMessage ??
                  "We couldn't verify your email. The link may have expired or is invalid."}
              </p>
            </div>

            <div className="p-3 rounded-lg bg-amber-50 border border-amber-100">
              <p className="text-[11px] text-amber-800 leading-relaxed">
                <strong>What to do:</strong> Go to Settings and request a new
                verification link. Old email remains active.
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <Button
                asChild
                className="w-full h-11 rounded-xl bg-slate-900 hover:bg-slate-800"
              >
                <Link href={ROUTES.SETTINGS}>
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Go to Settings
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                className="w-full h-11 rounded-xl"
              >
                <Link href={ROUTES.DASHBOARD}>Back to Dashboard</Link>
              </Button>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════ */}
        {/* INVALID */}
        {/* ═══════════════════════════════════════════ */}
        {status === "invalid" && (
          <div className="rounded-2xl bg-white border border-slate-200/60 p-8 text-center space-y-5">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
                <XCircle
                  className="w-8 h-8 text-slate-500"
                  strokeWidth={2.5}
                />
              </div>
            </div>

            <div className="space-y-2">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Invalid link
              </h1>
              <p className="text-sm text-slate-500 leading-relaxed">
                {errorMessage ??
                  "This verification link is invalid or has been tampered with."}
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <Button
                asChild
                className="w-full h-11 rounded-xl bg-slate-900 hover:bg-slate-800"
              >
                <Link href={ROUTES.SETTINGS}>Go to Settings</Link>
              </Button>

              <Button
                asChild
                variant="outline"
                className="w-full h-11 rounded-xl"
              >
                <Link href={ROUTES.DASHBOARD}>Back to Dashboard</Link>
              </Button>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════ */}
        {/* LOADING */}
        {/* ═══════════════════════════════════════════ */}
        {status === "loading" && (
          <div className="rounded-2xl bg-white border border-slate-200/60 p-12 text-center">
            <Loader2 className="w-10 h-10 text-slate-400 animate-spin mx-auto mb-3" />
            <p className="text-sm text-slate-500">Verifying your email...</p>
          </div>
        )}

        {/* Footer */}
        <p className="mt-6 text-center text-[10px] text-slate-400">
          © {new Date().getFullYear()} Kanani Creation
        </p>
      </div>
    </div>
  );
}
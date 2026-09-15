/**
 * Magic Link Verify Page
 * 
 * WHERE USER LANDS AFTER CLICKING MAGIC LINK.
 * 
 * Better Auth verifies token automatically via /api/auth/magic-link/verify
 * Then redirects to /dashboard (if successful) or shows error.
 * 
 * This page is a FALLBACK — rarely shown to user.
 */

import { redirect } from "next/navigation";

export const metadata = {
  title: "Verifying | Kanani Creation Ledger",
  description: "Verifying your sign-in link",
};

interface PageProps {
  searchParams: Promise<{
    token?: string;
    error?: string;
    callbackURL?: string;
  }>;
}

export default async function VerifyPage({ searchParams }: PageProps) {
  const params = await searchParams;

  // Better Auth auto-verifies via API route
  // If there's an error, show it
  if (params.error) {
    return (
      <div className="w-full max-w-md text-center space-y-4">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
            <span className="text-3xl">⚠️</span>
          </div>
        </div>
        <h1 className="text-2xl font-bold text-slate-900">
          Invalid Link
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed">
          This magic link is invalid or has expired. Please request a new one.
        </p>
        <a
          href="/login"
          className="inline-block px-6 py-3 rounded-xl bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition-colors"
        >
          Back to Login
        </a>
      </div>
    );
  }

  // If user reaches this page directly (no token), redirect to dashboard
  // (Better Auth already handled verification via API route)
  redirect("/dashboard");
}
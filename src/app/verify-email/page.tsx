/**
 * Verify Email Page — Server Component
 * 
 * FLOW:
 * 1. Extract token + ownerId from URL
 * 2. Check if session exists (Better Auth already verified)
 * 3. If session exists → SUCCESS
 * 4. If not → check custom verification
 * 5. Show appropriate state
 */

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { VerifyEmailClient } from "./verify-email-client";

export const metadata = {
  title: "Verify Email | Kanani Creation Ledger",
  description: "Verify your new email address",
};

interface PageProps {
  searchParams: Promise<{
    token?: string;
    ownerId?: string;
    error?: string;
  }>;
}

export default async function VerifyEmailPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const { token, ownerId, error } = params;

  // ═══════════════════════════════════════════
  // CHECK SESSION (Better Auth already verified)
  // ═══════════════════════════════════════════
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    // If user has session, check if email was recently changed
    if (session?.user) {
      const userEmail = session.user.email;
      
      // If email is verified, treat as success
      if (session.user.emailVerified) {
        return (
          <VerifyEmailClient
            status="success"
            newEmail={userEmail}
          />
        );
      }
    }
  } catch (err) {
    console.error("[VerifyEmail] Session check failed:", err);
  }

  // ═══════════════════════════════════════════
  // ERROR FROM URL
  // ═══════════════════════════════════════════
  if (error) {
    return (
      <VerifyEmailClient
        status="error"
        errorMessage="Verification link is invalid or has expired."
      />
    );
  }

  // ═══════════════════════════════════════════
  // MISSING PARAMS
  // ═══════════════════════════════════════════
  if (!token || !ownerId) {
    return (
      <VerifyEmailClient
        status="invalid"
        errorMessage="Missing verification parameters."
      />
    );
  }

  // ═══════════════════════════════════════════
  // ATTEMPT CUSTOM VERIFICATION (Legacy)
  // ═══════════════════════════════════════════
  try {
    const { verifyEmailChange } = await import(
      "@/features/settings/actions/verify-email-change"
    );

    const result = await verifyEmailChange({ token, ownerId });

    if (result.success) {
      return (
        <VerifyEmailClient
          status="success"
          newEmail={result.data?.newEmail}
        />
      );
    }

    // ⚠️ If custom verification fails, Better Auth might have already done it
    // Check session again
    const freshSession = await auth.api.getSession({
      headers: await headers(),
    });

    if (freshSession?.user?.emailVerified) {
      return (
        <VerifyEmailClient
          status="success"
          newEmail={freshSession.user.email}
        />
      );
    }

    return (
      <VerifyEmailClient
        status="error"
        errorMessage={result.error ?? "Verification failed."}
      />
    );
  } catch (err) {
    console.error("[VerifyEmail] Custom verification failed:", err);

    // Last resort — check session
    try {
      const freshSession = await auth.api.getSession({
        headers: await headers(),
      });

      if (freshSession?.user?.emailVerified) {
        return (
          <VerifyEmailClient
            status="success"
            newEmail={freshSession.user.email}
          />
        );
      }
    } catch {
      // Ignore
    }

    return (
      <VerifyEmailClient
        status="error"
        errorMessage="Verification failed. Please try again."
      />
    );
  }
}
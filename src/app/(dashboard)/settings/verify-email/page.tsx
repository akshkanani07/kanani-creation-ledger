/**
 * Verify Email Change — Landing Page
 * 
 * WHERE USER LANDS AFTER CLICKING VERIFICATION LINK IN EMAIL.
 * 
 * URL: /settings/verify-email?token=xxx&id=xxx
 * 
 * FLOW:
 * 1. Parse token + ownerId from URL
 * 2. Call verifyEmailChange() Server Action
 * 3. Show success/error state
 * 4. Auto-redirect to /settings on success
 */

import { Suspense } from "react";
import { redirect } from "next/navigation";
import { verifyEmailChange } from "@/features/settings/actions/verify-email-change";
import { VerifyEmailClient } from "@/features/settings/components/verify-email-client";

export const metadata = {
  title: "Verify Email | Kanani Creation Ledger",
  description: "Verifying your new email address",
};

// ═══════════════════════════════════════════════════════════
// PAGE PROPS
// ═══════════════════════════════════════════════════════════

interface PageProps {
  searchParams: Promise<{
    token?: string;
    id?: string;
  }>;
}

// ═══════════════════════════════════════════════════════════
// PAGE COMPONENT
// ═══════════════════════════════════════════════════════════

export default async function VerifyEmailPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const { token, id } = params;

  // ═══════════════════════════════════════════
  // MISSING PARAMS
  // ═══════════════════════════════════════════
  if (!token || !id) {
    return (
      <VerifyEmailClient
        status="invalid"
        errorMessage="Invalid verification link. Missing required parameters."
      />
    );
  }

  // ═══════════════════════════════════════════
  // CALL SERVER ACTION
  // ═══════════════════════════════════════════
  const result = await verifyEmailChange({ token, ownerId: id });

  if (!result.success) {
    return (
      <VerifyEmailClient
        status="error"
        errorMessage={result.error}
      />
    );
  }

  // ═══════════════════════════════════════════
  // SUCCESS
  // ═══════════════════════════════════════════
  return (
    <VerifyEmailClient
      status="success"
      newEmail={result.data.newEmail}
    />
  );
}
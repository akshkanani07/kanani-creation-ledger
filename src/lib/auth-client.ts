/**
 * Better Auth Client-side Helper
 * 
 * Provides React hooks and methods for Client Components.
 * 
 * USAGE:
 *   import { authClient } from "@/lib/auth-client";
 *   
 *   // In a client component:
 *   const { data: session, isPending } = authClient.useSession();
 *   
 *   // Sign in:
 *   await authClient.signIn.magicLink({ email });
 *   
 *   // Sign out:
 *   await authClient.signOut();
 */

import { createAuthClient } from "better-auth/react";
import { magicLinkClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL,
  plugins: [magicLinkClient()],
});

// Re-export commonly used hooks for convenience
export const {
  useSession,
  signIn,
  signOut,
  signUp,
} = authClient;
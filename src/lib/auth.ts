/**
 * Better Auth Server Configuration
 * 
 * Central authentication setup. Uses:
 * - Prisma adapter for database storage
 * - Magic Link plugin for passwordless login
 * - Mailjet for sending emails
 * 
 * DESIGN DECISIONS:
 * - No passwords: Single owner, email-based auth is safer
 * - 7-day sessions: Mobile-friendly, reduces re-login
 * - 10-min magic links: Security best practice
 * - Dashboard as callback: Direct redirect after login
 */

import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { magicLink } from "better-auth/plugins";
import { prisma } from "@/lib/prisma";
import { sendMagicLinkEmail } from "@/lib/mailjet";
import { env } from "@/config/env";

export const auth = betterAuth({
  // ═══════════════════════════════════════════
  // DATABASE
  // ═══════════════════════════════════════════
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  // ═══════════════════════════════════════════
  // EMAIL/PASSWORD (Disabled)
  // ═══════════════════════════════════════════
  emailAndPassword: {
    enabled: false,
  },

  // ═══════════════════════════════════════════
  // SESSION
  // ═══════════════════════════════════════════
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24,     // Refresh every 24h
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,            // 5 minutes
    },
  },

  // ═══════════════════════════════════════════
  // BASE URL & SECRET
  // ═══════════════════════════════════════════
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,

  // ═══════════════════════════════════════════
  // TRUSTED ORIGINS
  // ═══════════════════════════════════════════
  trustedOrigins: [
    "http://localhost:3000",
    env.NEXT_PUBLIC_APP_URL,
  ].filter(Boolean),

  // ═══════════════════════════════════════════
  // PLUGINS
  // ═══════════════════════════════════════════
  plugins: [
    magicLink({
      /**
       * Called by Better Auth when generating a magic link.
       * Sends email via Mailjet.
       */
      sendMagicLink: async ({ email, url }) => {
        console.log(`[MagicLink] Sending to: ${email}`);
        console.log(`[MagicLink] URL: ${url}`);

        await sendMagicLinkEmail({ email, url });
      },

      // Link expires in 10 minutes
      expiresIn: 60 * 10,

      // Disable sign-up — only existing users can log in
      disableSignUp: true,
    }),
  ],
});
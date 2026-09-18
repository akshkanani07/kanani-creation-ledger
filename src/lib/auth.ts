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
 * - Custom email change flow: request-email-change.ts (not Better Auth)
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
  // ⚠️ EMAIL CHANGE — Custom Flow
  // ═══════════════════════════════════════════
  // 
  // Better Auth no changeEmail plugin use NATHI karyo.
  // 
  // Custom flow:
  //   1. request-email-change.ts → verification record create
  //   2. Nava email par link mokle
  //   3. verify-email-change.ts → DB update
  //
  // Aa rite Better Auth no conflict nathi thато.

  // ═══════════════════════════════════════════
  // PLUGINS
  // ═══════════════════════════════════════════
  plugins: [
    magicLink({
      sendMagicLink: async ({ email, url }) => {
        console.log(`[MagicLink] ═══════════════════════════`);
        console.log(`[MagicLink] Input email: ${email}`);

        // ✅ DB thi owner nu fresh email lo
        const owner = await prisma.user.findFirst({
          select: { id: true, email: true, emailVerified: true },
        });

        if (!owner?.email) {
          console.error(`[MagicLink] ❌ No owner in DB`);
          throw new Error("Owner not found");
        }

        console.log(`[MagicLink] DB owner email: ${owner.email}`);
        console.log(`[MagicLink] DB emailVerified: ${owner.emailVerified}`);

        // ✅ DB thi fresh email par moklo
        await sendMagicLinkEmail({
          email: owner.email,
          url,
        });

        console.log(`[MagicLink] ✅ Sent to: ${owner.email}`);
      },

      expiresIn: 60 * 10, // 10 minutes
      disableSignUp: true,
    }),
  ],
});
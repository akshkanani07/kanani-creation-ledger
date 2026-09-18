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
import {
  sendMagicLinkEmail,
  sendEmailChangeVerification,
} from "@/lib/mailjet";
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
  // USER — CHANGE EMAIL
  // ═══════════════════════════════════════════
  user: {
    changeEmail: {
      enabled: true,

      /**
       * Called when user requests an email change.
       * Sends verification link to NEW email.
       */
      sendChangeEmailVerification: async ({ user, newEmail, url }) => {
        console.log(`[ChangeEmail] ═══════════════════════════`);
        console.log(`[ChangeEmail] OLD email: ${user.email}`);
        console.log(`[ChangeEmail] NEW email: ${newEmail}`);
        console.log(`[ChangeEmail] URL: ${url}`);
        console.log(`[ChangeEmail] Sending verification to new email...`);

        try {
          await sendEmailChangeVerification({
            oldEmail: user.email,
            newEmail,
            verificationUrl: url,
          });

          console.log(`[ChangeEmail] ✅ Verification sent to: ${newEmail}`);
        } catch (error) {
          console.error(`[ChangeEmail] ❌ Failed to send:`, error);
          throw error;
        }
      },

      /**
       * Called AFTER user clicks the verification link.
       * THIS updates the owner email in the database.
       */
      onEmailChange: async ({ user, newEmail }) => {
        console.log(`[ChangeEmail] ═══════════════════════════`);
        console.log(`[ChangeEmail] onEmailChange CALLED`);
        console.log(`[ChangeEmail] Updating DB: ${user.email} → ${newEmail}`);

        try {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              email: newEmail,
              emailVerified: true,
              updatedAt: new Date(),
            },
          });

          console.log(`[ChangeEmail] ✅ DB updated successfully`);
          console.log(`[ChangeEmail] New email: ${newEmail}`);
        } catch (error) {
          console.error(`[ChangeEmail] ❌ DB update failed:`, error);
          throw error;
        }
      },
    },
  },

  // ═══════════════════════════════════════════
  // PLUGINS
  // ═══════════════════════════════════════════
  plugins: [
    magicLink({
      sendMagicLink: async ({ email, url }) => {
        console.log(`[MagicLink] ═══════════════════════════`);
        console.log(`[MagicLink] Input email: ${email}`);

        // ✅ ALWAYS fetch fresh email from DB
        const owner = await prisma.user.findFirst({
          select: { id: true, email: true, emailVerified: true },
        });

        if (!owner?.email) {
          console.error(`[MagicLink] ❌ No owner found in DB`);
          throw new Error("Owner not found");
        }

        console.log(`[MagicLink] DB owner email: ${owner.email}`);
        console.log(`[MagicLink] DB emailVerified: ${owner.emailVerified}`);

        const targetEmail = owner.email;

        await sendMagicLinkEmail({
          email: targetEmail,
          url,
        });

        console.log(`[MagicLink] ✅ Magic link sent to: ${targetEmail}`);
      },

      expiresIn: 60 * 10, // 10 minutes
      disableSignUp: true,
    }),
  ],
});
/**
 * Better Auth Server Configuration
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
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
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
      sendChangeEmailVerification: async ({ user, newEmail, url }) => {
        console.log(`[ChangeEmail] ═══════════════════════════`);
        console.log(`[ChangeEmail] OLD email: ${user.email}`);
        console.log(`[ChangeEmail] NEW email: ${newEmail}`);
        console.log(`[ChangeEmail] URL: ${url}`);

        await sendEmailChangeVerification({
          oldEmail: user.email,
          newEmail,
          verificationUrl: url,
        });

        console.log(`[ChangeEmail] ✅ Sent to: ${newEmail}`);
      },
    },
  },

  // ═══════════════════════════════════════════
  // PLUGINS
  // ═══════════════════════════════════════════
  plugins: [
    magicLink({
      sendMagicLink: async ({ email, url }) => {
        console.log(`[MagicLink] Sending to: ${email}`);
        console.log(`[MagicLink] URL: ${url}`);

        await sendMagicLinkEmail({ email, url });

        console.log(`[MagicLink] ✅ Sent`);
      },
      expiresIn: 60 * 10,
      disableSignUp: true,
    }),
  ],
});
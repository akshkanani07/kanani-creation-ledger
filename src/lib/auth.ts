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
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  emailAndPassword: {
    enabled: false,
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
  },

  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,

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
        console.log(`[ChangeEmail] OLD: ${user.email}`);
        console.log(`[ChangeEmail] NEW: ${newEmail}`);
        console.log(`[ChangeEmail] URL: ${url}`);

        await sendEmailChangeVerification({
          oldEmail: user.email,
          newEmail,
          verificationUrl: url,
        });

        console.log(`[ChangeEmail] ✅ Verification sent to: ${newEmail}`);
      },

      onEmailChange: async ({ user, newEmail }) => {
        console.log(`[ChangeEmail] onEmailChange CALLED`);
        console.log(`[ChangeEmail] Updating: ${user.email} → ${newEmail}`);

        await prisma.user.update({
          where: { id: user.id },
          data: {
            email: newEmail,
            emailVerified: true,
            updatedAt: new Date(),
          },
        });

        console.log(`[ChangeEmail] ✅ DB updated: ${newEmail}`);
      },
    },
  },

  // ═══════════════════════════════════════════
  // PLUGINS
  // ═══════════════════════════════════════════
  plugins: [
    magicLink({
      sendMagicLink: async ({ email, url }) => {
        console.log(`[MagicLink] Input email: ${email}`);

        // ✅ DB thi fresh email
        const owner = await prisma.user.findFirst({
          select: { id: true, email: true, emailVerified: true },
        });

        if (!owner?.email) {
          console.error(`[MagicLink] ❌ No owner in DB`);
          throw new Error("Owner not found");
        }

        console.log(`[MagicLink] DB owner email: ${owner.email}`);

        await sendMagicLinkEmail({
          email: owner.email,
          url,
        });

        console.log(`[MagicLink] ✅ Sent to: ${owner.email}`);
      },

      expiresIn: 60 * 10,
      disableSignUp: true,
    }),
  ],
});
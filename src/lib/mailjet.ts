/**
 * Mailjet Email Service — Ultra Premium Templates
 * 
 * HANDLES:
 * - Magic Link sign-in emails
 * - Email Change verification emails
 * 
 * FEATURES:
 * - HTML + Plain Text fallback
 * - Master Logo in Header
 * - Brand-consistent design
 * - Mobile responsive
 * - Preheader optimization
 */

import Mailjet from "node-mailjet";
import { env } from "@/config/env";

// ═══════════════════════════════════════════════════════════
// BRAND CONSTANTS
// ═══════════════════════════════════════════════════════════

const BRAND = {
  name: "Kanani Creation",
  product: "Kanani Creation Ledger",
  tagline: "Ledger Management System",
  industry: "Textile Manufacturing",
  colors: {
    primary: "#0f172a",
    secondary: "#1e293b",
    accent: "#3b82f6",
    success: "#10b981",
    warning: "#f59e0b",
    danger: "#ef4444",
    bgLight: "#f1f5f9",
    bgCard: "#ffffff",
    bgMuted: "#f8fafc",
    textPrimary: "#0f172a",
    textSecondary: "#475569",
    textMuted: "#94a3b8",
    textSubtle: "#cbd5e1",
    border: "#e2e8f0",
  },
  support: env.MAILJET_FROM_EMAIL,
  footer: "This is an automated message — please do not reply",
  expiryMinutes: 10,
  changeExpiryMinutes: 15,
} as const;

// ═══════════════════════════════════════════════════════════
// HELPERS — Logo URL
// ═══════════════════════════════════════════════════════════

function getLogoUrl(): string {
  const baseUrl = env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return `${baseUrl}/icons/logo.png`;
}

// ═══════════════════════════════════════════════════════════
// MAILJET CLIENT
// ═══════════════════════════════════════════════════════════

const mailjet = Mailjet.apiConnect(
  env.MAILJET_API_KEY,
  env.MAILJET_SECRET_KEY
);

// ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════

interface SendMagicLinkParams {
  email: string;
  url: string;
  name?: string;
}

interface SendEmailChangeParams {
  newEmail: string;
  oldEmail: string;
  verificationUrl: string;
  expiresInMinutes?: number;
}

interface SendEmailParams {
  to: { email: string; name?: string };
  subject: string;
  html: string;
  text: string;
  campaign?: string;
}

// ═══════════════════════════════════════════════════════════
// CORE SEND HANDLER
// ═══════════════════════════════════════════════════════════

async function sendEmail({
  to,
  subject,
  html,
  text,
  campaign,
}: SendEmailParams): Promise<void> {
  try {
    await mailjet.post("send", { version: "v3.1" }).request({
      Messages: [
        {
          From: {
            Email: env.MAILJET_FROM_EMAIL,
            Name: env.MAILJET_FROM_NAME,
          },
          To: [
            {
              Email: to.email,
              Name: to.name ?? "Owner",
            },
          ],
          ReplyTo: {
            Email: env.MAILJET_FROM_EMAIL,
            Name: env.MAILJET_FROM_NAME,
          },
          Subject: subject,
          HTMLPart: html,
          TextPart: text,
          TrackOpens: "enabled",
          TrackClicks: "enabled",
          CustomCampaign: campaign ?? BRAND.product,
        },
      ],
    });
  } catch (error) {
    console.error("[Mailjet] Send failed:", error);
    throw new Error("Failed to send email");
  }
}

// ═══════════════════════════════════════════════════════════
// PUBLIC API — MAGIC LINK
// ═══════════════════════════════════════════════════════════

export async function sendMagicLinkEmail({
  email,
  url,
  name = "Owner",
}: SendMagicLinkParams): Promise<void> {
  await sendEmail({
    to: { email, name },
    subject: `🔐 ${name}, sign in to ${BRAND.product}`,
    html: buildMagicLinkHtml({ url, name }),
    text: buildMagicLinkText({ url, name }),
    campaign: "Magic Link Sign In",
  });
}

// ═══════════════════════════════════════════════════════════
// PUBLIC API — EMAIL CHANGE VERIFICATION
// ═══════════════════════════════════════════════════════════

export async function sendEmailChangeVerification({
  newEmail,
  oldEmail,
  verificationUrl,
  expiresInMinutes = BRAND.changeExpiryMinutes,
}: SendEmailChangeParams): Promise<void> {
  await sendEmail({
    to: { email: newEmail, name: "Owner" },
    subject: `🔐 Verify your new email — ${BRAND.product}`,
    html: buildEmailChangeHtml({
      newEmail,
      oldEmail,
      verificationUrl,
      expiresInMinutes,
    }),
    text: buildEmailChangeText({
      newEmail,
      oldEmail,
      verificationUrl,
      expiresInMinutes,
    }),
    campaign: "Email Change Verification",
  });
}

// ═══════════════════════════════════════════════════════════
// HTML TEMPLATE — MAGIC LINK
// ═══════════════════════════════════════════════════════════

function buildMagicLinkHtml({
  url,
  name,
}: {
  url: string;
  name: string;
}): string {
  const year = new Date().getFullYear();
  const date = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="light dark" />
  <title>Sign in to ${BRAND.product}</title>
</head>
<body style="margin: 0; padding: 0; background-color: ${BRAND.colors.bgLight}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; -webkit-font-smoothing: antialiased;">

  <div style="display: none; font-size: 1px; line-height: 1px; max-height: 0; max-width: 0; opacity: 0; overflow: hidden;">
    Hi ${name}, your secure sign-in link for ${BRAND.product} is ready. Expires in ${BRAND.expiryMinutes} minutes.
  </div>

  <table role="presentation" width="100%" style="background-color: ${BRAND.colors.bgLight}; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" style="max-width: 600px; width: 100%; background-color: ${BRAND.colors.bgCard}; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 40px rgba(15, 23, 42, 0.08);">

          <tr>
            <td style="height: 6px; background: linear-gradient(90deg, ${BRAND.colors.primary} 0%, #1e40af 50%, ${BRAND.colors.accent} 100%); line-height: 6px; font-size: 0;">&nbsp;</td>
          </tr>

          <tr>
            <td align="center" style="padding: 44px 48px 28px 48px;">
              <table role="presentation" style="margin: 0 auto;">
                <tr>
                  <td align="center">
                    <img 
                      src="${getLogoUrl()}" 
                      alt="${BRAND.name}" 
                      width="64" 
                      height="64" 
                      style="display: block; border-radius: 14px; width: 64px; height: 64px; object-fit: cover;"
                    />
                  </td>
                </tr>
              </table>

              <h1 style="margin: 24px 0 6px 0; font-size: 24px; font-weight: 800; color: ${BRAND.colors.primary}; letter-spacing: -0.6px;">
                ${BRAND.name}
              </h1>
              <p style="margin: 0; font-size: 12px; color: #64748b; font-weight: 600; letter-spacing: 1px; text-transform: uppercase;">
                ${BRAND.tagline}
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding: 0 48px;">
              <div style="height: 1px; background: linear-gradient(90deg, transparent 0%, ${BRAND.colors.border} 50%, transparent 100%);"></div>
            </td>
          </tr>

          <tr>
            <td style="padding: 36px 48px 32px 48px;">
              <h2 style="margin: 0 0 8px 0; font-size: 22px; font-weight: 700; color: ${BRAND.colors.primary}; letter-spacing: -0.4px;">
                Hello ${name} 👋
              </h2>

              <p style="margin: 0 0 28px 0; font-size: 15px; line-height: 1.65; color: ${BRAND.colors.textSecondary};">
                Someone requested a sign-in link for your <strong style="color: ${BRAND.colors.primary};">${BRAND.product}</strong> account. Click the button below to securely access your dashboard.
              </p>

              <table role="presentation" width="100%" style="margin: 0 0 28px 0;">
                <tr>
                  <td align="center">
                    <a href="${url}" 
                       target="_blank"
                       style="display: inline-block; padding: 17px 44px; font-size: 15px; font-weight: 700; color: #ffffff; background-color: ${BRAND.colors.primary}; text-decoration: none; border-radius: 10px; letter-spacing: 0.3px; box-shadow: 0 4px 14px rgba(15, 23, 42, 0.25);">
                      Sign In to Ledger &nbsp;→
                    </a>
                  </td>
                </tr>
              </table>

              <table role="presentation" width="100%" style="margin: 0 0 28px 0;">
                <tr>
                  <td>
                    <p style="margin: 0 0 8px 0; font-size: 12px; color: ${BRAND.colors.textMuted}; text-align: center;">
                      Button not working? Copy this link:
                    </p>
                    <div style="background-color: ${BRAND.colors.bgMuted}; border: 1px solid ${BRAND.colors.border}; border-radius: 8px; padding: 12px 14px; word-break: break-all;">
                      <p style="margin: 0; font-size: 11px; color: ${BRAND.colors.textSecondary}; font-family: 'Courier New', monospace; line-height: 1.5;">
                        ${url}
                      </p>
                    </div>
                  </td>
                </tr>
              </table>

              <table role="presentation" width="100%" style="margin: 0 0 16px 0; background-color: #fef3c7; border-left: 4px solid ${BRAND.colors.warning}; border-radius: 8px;">
                <tr>
                  <td style="padding: 14px 16px;">
                    <p style="margin: 0; font-size: 13px; color: #92400e; line-height: 1.5; font-weight: 500;">
                      ⏱️ &nbsp;This link expires in <strong>${BRAND.expiryMinutes} minutes</strong> for your security.
                    </p>
                  </td>
                </tr>
              </table>

              <table role="presentation" width="100%" style="background-color: #f0fdf4; border-left: 4px solid ${BRAND.colors.success}; border-radius: 8px;">
                <tr>
                  <td style="padding: 14px 16px;">
                    <p style="margin: 0; font-size: 13px; color: #065f46; line-height: 1.5;">
                      <strong>🛡️ Security:</strong> If you didn't request this sign-in, you can safely ignore this email.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding: 24px 48px; background-color: ${BRAND.colors.bgMuted}; border-top: 1px solid ${BRAND.colors.border};">
              <table role="presentation" width="100%">
                <tr>
                  <td align="center" style="padding-bottom: 12px;">
                    <p style="margin: 0; font-size: 11px; color: #64748b; line-height: 1.6;">
                      Sent on ${date} &nbsp;•&nbsp; ${BRAND.product}
                    </p>
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <p style="margin: 0 0 6px 0; font-size: 11px; color: ${BRAND.colors.textMuted};">
                      © ${year} ${BRAND.name}. All rights reserved.
                    </p>
                    <p style="margin: 0; font-size: 10px; color: ${BRAND.colors.textSubtle}; letter-spacing: 0.3px;">
                      ${BRAND.footer}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>

        <table role="presentation" width="600" style="max-width: 600px; margin-top: 20px;">
          <tr>
            <td align="center" style="padding: 0 20px;">
              <p style="margin: 0; font-size: 11px; color: ${BRAND.colors.textMuted}; line-height: 1.6;">
                Can't find this email? Check your <strong style="color: #64748b;">Spam</strong> or <strong style="color: #64748b;">Promotions</strong> folder.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>

</body>
</html>`;
}

// ═══════════════════════════════════════════════════════════
// PLAIN TEXT — MAGIC LINK
// ═══════════════════════════════════════════════════════════

function buildMagicLinkText({
  url,
  name,
}: {
  url: string;
  name: string;
}): string {
  return `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ${BRAND.name.toUpperCase()} — ${BRAND.tagline.toUpperCase()}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Hello ${name},

Someone requested a sign-in link for your ${BRAND.product} account.

👉 SIGN IN NOW:
${url}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⏱️  This link expires in ${BRAND.expiryMinutes} minutes.
🛡️  If you didn't request this, ignore this email.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

© ${new Date().getFullYear()} ${BRAND.name}
${BRAND.footer}
  `.trim();
}

// ═══════════════════════════════════════════════════════════
// HTML TEMPLATE — EMAIL CHANGE VERIFICATION
// ═══════════════════════════════════════════════════════════

function buildEmailChangeHtml({
  newEmail,
  oldEmail,
  verificationUrl,
  expiresInMinutes,
}: {
  newEmail: string;
  oldEmail: string;
  verificationUrl: string;
  expiresInMinutes: number;
}): string {
  const year = new Date().getFullYear();
  const date = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="light dark" />
  <title>Verify your new email — ${BRAND.product}</title>
</head>
<body style="margin: 0; padding: 0; background-color: ${BRAND.colors.bgLight}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; -webkit-font-smoothing: antialiased;">

  <div style="display: none; font-size: 1px; line-height: 1px; max-height: 0; max-width: 0; opacity: 0; overflow: hidden;">
    Verify your new email address for ${BRAND.product}. Expires in ${expiresInMinutes} minutes.
  </div>

  <table role="presentation" width="100%" style="background-color: ${BRAND.colors.bgLight}; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" style="max-width: 600px; width: 100%; background-color: ${BRAND.colors.bgCard}; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 40px rgba(15, 23, 42, 0.08);">

          <tr>
            <td style="height: 6px; background: linear-gradient(90deg, ${BRAND.colors.primary} 0%, #1e40af 50%, ${BRAND.colors.accent} 100%); line-height: 6px; font-size: 0;">&nbsp;</td>
          </tr>

          <tr>
            <td align="center" style="padding: 44px 48px 28px 48px;">
              <table role="presentation" style="margin: 0 auto;">
                <tr>
                  <td align="center">
                    <img 
                      src="${getLogoUrl()}" 
                      alt="${BRAND.name}" 
                      width="64" 
                      height="64" 
                      style="display: block; border-radius: 14px; width: 64px; height: 64px; object-fit: cover;"
                    />
                  </td>
                </tr>
              </table>

              <h1 style="margin: 24px 0 6px 0; font-size: 24px; font-weight: 800; color: ${BRAND.colors.primary}; letter-spacing: -0.6px;">
                ${BRAND.name}
              </h1>
              <p style="margin: 0; font-size: 12px; color: #64748b; font-weight: 600; letter-spacing: 1px; text-transform: uppercase;">
                ${BRAND.tagline}
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding: 0 48px;">
              <div style="height: 1px; background: linear-gradient(90deg, transparent 0%, ${BRAND.colors.border} 50%, transparent 100%);"></div>
            </td>
          </tr>

          <tr>
            <td style="padding: 36px 48px 32px 48px;">
              <h2 style="margin: 0 0 12px 0; font-size: 22px; font-weight: 700; color: ${BRAND.colors.primary}; letter-spacing: -0.4px;">
                Verify your new email 📧
              </h2>

              <p style="margin: 0 0 20px 0; font-size: 15px; line-height: 1.65; color: ${BRAND.colors.textSecondary};">
                You requested to change your ${BRAND.product} account email from
                <strong style="color: ${BRAND.colors.primary};">${oldEmail}</strong> to
                <strong style="color: ${BRAND.colors.primary};">${newEmail}</strong>.
              </p>

              <p style="margin: 0 0 28px 0; font-size: 15px; line-height: 1.65; color: ${BRAND.colors.textSecondary};">
                Click the button below to confirm this change. Your old email remains
                active until you verify the new one.
              </p>

              <table role="presentation" width="100%" style="margin: 0 0 28px 0;">
                <tr>
                  <td align="center">
                    <a href="${verificationUrl}" 
                       target="_blank"
                       style="display: inline-block; padding: 17px 44px; font-size: 15px; font-weight: 700; color: #ffffff; background-color: ${BRAND.colors.primary}; text-decoration: none; border-radius: 10px; letter-spacing: 0.3px; box-shadow: 0 4px 14px rgba(15, 23, 42, 0.25);">
                      Verify New Email &nbsp;→
                    </a>
                  </td>
                </tr>
              </table>

              <table role="presentation" width="100%" style="margin: 0 0 20px 0;">
                <tr>
                  <td>
                    <p style="margin: 0 0 8px 0; font-size: 12px; color: ${BRAND.colors.textMuted}; text-align: center;">
                      Button not working? Copy this link:
                    </p>
                    <div style="background-color: ${BRAND.colors.bgMuted}; border: 1px solid ${BRAND.colors.border}; border-radius: 8px; padding: 12px 14px; word-break: break-all;">
                      <p style="margin: 0; font-size: 11px; color: ${BRAND.colors.textSecondary}; font-family: 'Courier New', monospace; line-height: 1.5;">
                        ${verificationUrl}
                      </p>
                    </div>
                  </td>
                </tr>
              </table>

              <table role="presentation" width="100%" style="margin: 0 0 16px 0; background-color: #fef3c7; border-left: 4px solid ${BRAND.colors.warning}; border-radius: 8px;">
                <tr>
                  <td style="padding: 14px 16px;">
                    <p style="margin: 0; font-size: 13px; color: #92400e; line-height: 1.5; font-weight: 500;">
                      ⏱️ &nbsp;This verification link expires in <strong>${expiresInMinutes} minutes</strong>.
                    </p>
                  </td>
                </tr>
              </table>

              <table role="presentation" width="100%" style="background-color: #f0fdf4; border-left: 4px solid ${BRAND.colors.success}; border-radius: 8px;">
                <tr>
                  <td style="padding: 14px 16px;">
                    <p style="margin: 0; font-size: 13px; color: #065f46; line-height: 1.5;">
                      <strong>🛡️ Important:</strong> If you didn't request this change, ignore this email. Your account remains secure — no data will be modified.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding: 24px 48px; background-color: ${BRAND.colors.bgMuted}; border-top: 1px solid ${BRAND.colors.border};">
              <table role="presentation" width="100%">
                <tr>
                  <td align="center" style="padding-bottom: 12px;">
                    <p style="margin: 0; font-size: 11px; color: #64748b; line-height: 1.6;">
                      Sent on ${date} &nbsp;•&nbsp; ${BRAND.product}
                    </p>
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <p style="margin: 0 0 6px 0; font-size: 11px; color: ${BRAND.colors.textMuted};">
                      © ${year} ${BRAND.name}. All rights reserved.
                    </p>
                    <p style="margin: 0; font-size: 10px; color: ${BRAND.colors.textSubtle}; letter-spacing: 0.3px;">
                      ${BRAND.footer}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>

        <table role="presentation" width="600" style="max-width: 600px; margin-top: 20px;">
          <tr>
            <td align="center" style="padding: 0 20px;">
              <p style="margin: 0; font-size: 11px; color: ${BRAND.colors.textMuted}; line-height: 1.6;">
                Can't find this email? Check your <strong style="color: #64748b;">Spam</strong> or <strong style="color: #64748b;">Promotions</strong> folder.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>

</body>
</html>`;
}

// ═══════════════════════════════════════════════════════════
// PLAIN TEXT — EMAIL CHANGE VERIFICATION
// ═══════════════════════════════════════════════════════════

function buildEmailChangeText({
  newEmail,
  oldEmail,
  verificationUrl,
  expiresInMinutes,
}: {
  newEmail: string;
  oldEmail: string;
  verificationUrl: string;
  expiresInMinutes: number;
}): string {
  return `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ${BRAND.name.toUpperCase()} — VERIFY EMAIL CHANGE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

You requested to change your ${BRAND.product} account email.

Current: ${oldEmail}
New:     ${newEmail}

👉 VERIFY NOW:
${verificationUrl}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⏱️  This link expires in ${expiresInMinutes} minutes.
🛡️  If you didn't request this, ignore this email.
    Your account remains secure.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

© ${new Date().getFullYear()} ${BRAND.name}
${BRAND.footer}
  `.trim();
}
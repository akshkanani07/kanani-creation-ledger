/**
 * Settings Page — Server Component
 * 
 * FEATURES:
 * - Account section (email change)
 * - Backup & Export (JSON download)
 * - Recent Activity Logs
 * - About section
 */

import { headers } from "next/headers";
import {
  Settings as SettingsIcon,
  User,
  Database,
  Activity,
  Info,
  Building2,
  Package,
} from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { siteConfig } from "@/config/site";
import { EmailChangeForm } from "@/features/settings/components/email-change-form";
import { BackupExportButton } from "@/features/settings/components/backup-export-button";
import { RecentActivity } from "@/features/settings/components/recent-activity";

export const metadata = {
  title: "Settings | Kanani Creation Ledger",
  description: "Account settings and preferences",
};

// ═══════════════════════════════════════════════════════════
// PAGE COMPONENT
// ═══════════════════════════════════════════════════════════

export default async function SettingsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const ownerEmail = session?.user?.email ?? "unknown";

  // Fetch activity logs
  const activityLogs = await prisma.activityLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 10,
    select: {
      id: true,
      action: true,
      entityType: true,
      entityId: true,
      metadata: true,
      createdAt: true,
    },
  });

  // Stats
  const [karigarCount, transactionCount, activityCount] = await Promise.all([
    prisma.karigar.count({ where: { deletedAt: null } }),
    prisma.transaction.count({ where: { deletedAt: null } }),
    prisma.activityLog.count(),
  ]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* PAGE HEADER */}
      <div className="space-y-1">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-[10px] font-semibold tracking-wide uppercase">
          <SettingsIcon className="w-3 h-3" />
          Settings
        </div>
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">
          Settings
        </h1>
        <p className="text-sm text-slate-500">
          Manage your account, backup, and preferences
        </p>
      </div>

      {/* ACCOUNT SECTION */}
      <Section
        icon={User}
        title="Account"
        description="Manage your email and login"
      >
        <EmailChangeForm currentEmail={ownerEmail} />
      </Section>

      {/* BACKUP SECTION */}
      <Section
        icon={Database}
        title="Backup & Export"
        description="Download complete data backup"
      >
        <div className="space-y-3">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-2.5">
            <StatBox label="Karigars" value={karigarCount} />
            <StatBox label="Transactions" value={transactionCount} />
            <StatBox label="Activity Logs" value={activityCount} />
          </div>

          {/* Export Button */}
          <BackupExportButton />

          {/* Info */}
          <div className="flex items-start gap-2 p-3 rounded-lg bg-slate-50 border border-slate-100">
            <Info className="w-3.5 h-3.5 text-slate-500 flex-shrink-0 mt-0.5" />
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Downloads a complete JSON backup of all your data. Keep it safe
              for disaster recovery.
            </p>
          </div>
        </div>
      </Section>

      {/* ACTIVITY LOGS SECTION */}
      <Section
        icon={Activity}
        title="Recent Activity"
        description="Last 10 actions in your account"
      >
        <RecentActivity logs={activityLogs} />
      </Section>

      {/* ABOUT SECTION */}
      <Section
        icon={Info}
        title="About"
        description="Application information"
      >
        <div className="space-y-2.5">
          <InfoRow
            icon={Package}
            label="Application"
            value={siteConfig.name}
          />
          <InfoRow
            icon={Building2}
            label="Company"
            value={siteConfig.company.name}
          />
          <InfoRow
            icon={Info}
            label="Industry"
            value={siteConfig.company.industry}
          />
          <InfoRow
            icon={Package}
            label="Version"
            value={`v${siteConfig.version}`}
          />
        </div>
      </Section>

      {/* FOOTER */}
      <div className="text-center py-4">
        <p className="text-[10px] text-slate-400">
          © {new Date().getFullYear()} {siteConfig.company.name} • All rights reserved
        </p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// SECTION COMPONENT
// ═══════════════════════════════════════════════════════════

function Section({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-white border border-slate-200/60 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
            <Icon className="w-4 h-4 text-slate-700" strokeWidth={2.25} />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
            <p className="text-[11px] text-slate-500 mt-0.5">{description}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">{children}</div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// STAT BOX
// ═══════════════════════════════════════════════════════════

function StatBox({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-slate-50 border border-slate-100 p-3 text-center">
      <p className="text-lg font-bold text-slate-900 tabular-nums">{value}</p>
      <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider mt-0.5">
        {label}
      </p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// INFO ROW
// ═══════════════════════════════════════════════════════════

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-2 border-b border-slate-100 last:border-b-0">
      <div className="flex items-center gap-2.5">
        <Icon className="w-3.5 h-3.5 text-slate-400" strokeWidth={2.25} />
        <p className="text-xs text-slate-500">{label}</p>
      </div>
      <p className="text-xs font-semibold text-slate-900">{value}</p>
    </div>
  );
}
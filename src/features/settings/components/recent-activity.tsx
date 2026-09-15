/**
 * Recent Activity — Display Activity Logs
 * 
 * FEATURES:
 * - Action icons (Create, Update, Delete, Login, etc.)
 * - Human-readable descriptions
 * - Relative time
 * - Empty state
 */

import {
  Plus,
  Pencil,
  Trash2,
  LogIn,
  LogOut,
  Download,
  Share2,
  Mail,
  Activity,
  type LucideIcon,
} from "lucide-react";
import { cn, formatRelativeTime } from "@/lib/utils";

// ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════

interface ActivityLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string | null;
  metadata: unknown;
  createdAt: Date;
}

interface RecentActivityProps {
  logs: ActivityLog[];
}

// ═══════════════════════════════════════════════════════════
// ACTION STYLES
// ═══════════════════════════════════════════════════════════

const ACTION_STYLES: Record<
  string,
  {
    icon: LucideIcon;
    bg: string;
    color: string;
    label: string;
  }
> = {
  CREATE: {
    icon: Plus,
    bg: "bg-emerald-50",
    color: "text-emerald-600",
    label: "Created",
  },
  UPDATE: {
    icon: Pencil,
    bg: "bg-blue-50",
    color: "text-blue-600",
    label: "Updated",
  },
  DELETE: {
    icon: Trash2,
    bg: "bg-red-50",
    color: "text-red-600",
    label: "Deleted",
  },
  LOGIN: {
    icon: LogIn,
    bg: "bg-violet-50",
    color: "text-violet-600",
    label: "Logged in",
  },
  LOGOUT: {
    icon: LogOut,
    bg: "bg-slate-100",
    color: "text-slate-600",
    label: "Logged out",
  },
  EXPORT: {
    icon: Download,
    bg: "bg-amber-50",
    color: "text-amber-600",
    label: "Exported",
  },
  SHARE: {
    icon: Share2,
    bg: "bg-indigo-50",
    color: "text-indigo-600",
    label: "Shared",
  },
  EMAIL_CHANGE: {
    icon: Mail,
    bg: "bg-pink-50",
    color: "text-pink-600",
    label: "Email changed",
  },
};

// ═══════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════

export function RecentActivity({ logs }: RecentActivityProps) {
  if (logs.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
          <Activity className="w-5 h-5 text-slate-400" />
        </div>
        <p className="text-sm font-medium text-slate-900 mb-1">
          No activity yet
        </p>
        <p className="text-xs text-slate-500">
          Your actions will appear here
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-2">
      {logs.map((log) => {
        const style = ACTION_STYLES[log.action] ?? {
          icon: Activity,
          bg: "bg-slate-100",
          color: "text-slate-600",
          label: log.action,
        };

        const Icon = style.icon;
        const description = buildDescription(log);

        return (
          <li
            key={log.id}
            className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <div
              className={cn(
                "flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center",
                style.bg
              )}
            >
              <Icon
                className={cn("w-3.5 h-3.5", style.color)}
                strokeWidth={2.5}
              />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-xs text-slate-700 leading-relaxed">
                {description}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {formatRelativeTime(log.createdAt)}
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

// ═══════════════════════════════════════════════════════════
// DESCRIPTION BUILDER
// ═══════════════════════════════════════════════════════════

function buildDescription(log: ActivityLog): string {
  const meta = log.metadata as Record<string, unknown> | null;

  const style = ACTION_STYLES[log.action];
  const actionLabel = style?.label ?? log.action;

  if (log.entityType === "Karigar") {
    const name = (meta?.name as string) ?? "karigar";
    return `${actionLabel} karigar "${name}"`;
  }

  if (log.entityType === "Transaction") {
    const amount = meta?.amount;
    const karigarName = meta?.karigarName;
    if (amount && karigarName) {
      return `${actionLabel} transaction ₹${amount} for ${karigarName}`;
    }
    return `${actionLabel} transaction`;
  }

  if (log.entityType === "Owner") {
    if (log.action === "EMAIL_CHANGE") {
      const oldEmail = meta?.oldEmail;
      const newEmail = meta?.newEmail;
      const status = meta?.status;

      if (status === "requested") {
        return `Requested email change to ${newEmail}`;
      }
      if (status === "completed") {
        return `Email changed from ${oldEmail} to ${newEmail}`;
      }
      return "Email change";
    }
    return actionLabel;
  }

  return `${actionLabel} ${log.entityType}`;
}
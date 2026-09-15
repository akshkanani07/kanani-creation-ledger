/**
 * Report Types
 * 
 * Type definitions for the Reports feature.
 * Supports PDF, Excel, and WhatsApp exports.
 * 
 * USAGE:
 *   import type { ReportData, ReportFilters } from "@/features/report/types";
 */

import type {
  TransactionType,
  TransactionDirection,
} from "@/config/constants";

// ═══════════════════════════════════════════════════════════
// REPORT SCOPE
// ═══════════════════════════════════════════════════════════

export type ReportScope = "karigar" | "all-karigars" | "by-type";

export type ReportFormat = "pdf" | "excel" | "whatsapp";

// ═══════════════════════════════════════════════════════════
// REPORT FILTERS
// ═══════════════════════════════════════════════════════════

export interface ReportFilters {
  scope: ReportScope;
  karigarId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  type?: TransactionType;
  direction?: TransactionDirection;
}

// ═══════════════════════════════════════════════════════════
// REPORT TRANSACTION
// ═══════════════════════════════════════════════════════════

export interface ReportTransaction {
  id: string;
  date: Date;
  type: TransactionType;
  direction: TransactionDirection;
  amount: number;
  quantity: number | null;
  rate: number | null;
  paymentMode: string | null;
  reference: string | null;
  description: string;
  runningBalance: number;
}

// ═══════════════════════════════════════════════════════════
// KARIGAR SUMMARY
// ═══════════════════════════════════════════════════════════

export interface KarigarSummary {
  id: string;
  name: string;
  phone: string;
  address: string | null;
  photoUrl: string | null;
  openingBalance: number;
  totalCredit: number;
  totalDebit: number;
  closingBalance: number;
  transactionCount: number;
}

// ═══════════════════════════════════════════════════════════
// TYPE DISTRIBUTION
// ═══════════════════════════════════════════════════════════

export interface TypeDistributionItem {
  type: TransactionType;
  count: number;
  totalAmount: number;
}

// ═══════════════════════════════════════════════════════════
// REPORT METADATA
// ═══════════════════════════════════════════════════════════

export interface ReportMetadata {
  generatedAt: Date;
  period: {
    from: Date | null;
    to: Date | null;
    label: string; // "1 Apr 2026 - 30 Sep 2026" or "All Time"
  };
  companyName: string;
  companyIndustry: string;
}

// ═══════════════════════════════════════════════════════════
// REPORT DATA (Union by scope)
// ═══════════════════════════════════════════════════════════

/**
 * Single Karigar Report
 */
export interface KarigarReportData {
  scope: "karigar";
  metadata: ReportMetadata;
  karigar: KarigarSummary;
  transactions: ReportTransaction[];
}

/**
 * All Karigars Summary Report
 */
export interface AllKarigarsReportData {
  scope: "all-karigars";
  metadata: ReportMetadata;
  karigars: KarigarSummary[];
  totals: {
    totalKarigars: number;
    totalCredit: number;
    totalDebit: number;
    totalClosing: number;
  };
}

/**
 * By-Type Report
 */
export interface ByTypeReportData {
  scope: "by-type";
  metadata: ReportMetadata;
  distribution: TypeDistributionItem[];
  transactions: ReportTransaction[];
}

/**
 * Union — Any Report Data
 */
export type ReportData =
  | KarigarReportData
  | AllKarigarsReportData
  | ByTypeReportData;

// ═══════════════════════════════════════════════════════════
// REPORT RESULT
// ═══════════════════════════════════════════════════════════

export interface ReportFileResult {
  /** Base64-encoded file content */
  base64: string;
  /** MIME type */
  mimeType: string;
  /** Suggested filename */
  filename: string;
  /** Size in bytes */
  size: number;
}

// ═══════════════════════════════════════════════════════════
// PRESET DATE RANGES
// ═══════════════════════════════════════════════════════════

export type DateRangePreset =
  | "today"
  | "this-week"
  | "this-month"
  | "last-30-days"
  | "this-quarter"
  | "this-year"
  | "last-year"
  | "all-time"
  | "custom";

export interface DateRangeOption {
  value: DateRangePreset;
  label: string;
}
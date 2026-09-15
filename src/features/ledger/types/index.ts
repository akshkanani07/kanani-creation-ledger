/**
 * Ledger Types
 * 
 * Types for running ledger with balance calculation.
 * 
 * USAGE:
 *   import type { LedgerEntry, LedgerFilters } from "@/features/ledger/types";
 */

import type {
  TransactionType,
  TransactionDirection,
} from "@/config/constants";

// ═══════════════════════════════════════════════════════════
// LEDGER ENTRY
// ═══════════════════════════════════════════════════════════

/**
 * A single ledger entry with running balance.
 * The balance is computed cumulatively (Credit − Debit).
 */
export interface LedgerEntry {
  id: string;
  date: Date;
  type: TransactionType;
  direction: TransactionDirection;
  amount: number;
  description: string;
  reference: string | null;
  paymentMode: string | null;
  quantity: number | null;
  rate: number | null;
  /** Running balance AFTER this entry */
  runningBalance: number;
}

// ═══════════════════════════════════════════════════════════
// LEDGER SUMMARY
// ═══════════════════════════════════════════════════════════

/**
 * Summary of ledger for a date range.
 */
export interface LedgerSummary {
  openingBalance: number;
  totalCredit: number;
  totalDebit: number;
  closingBalance: number;
  totalEntries: number;
}

// ═══════════════════════════════════════════════════════════
// LEDGER FILTERS
// ═══════════════════════════════════════════════════════════

export interface LedgerFilters {
  karigarId: string;
  dateFrom?: Date;
  dateTo?: Date;
  type?: TransactionType;
}

// ═══════════════════════════════════════════════════════════
// LEDGER RESULT
// ═══════════════════════════════════════════════════════════

export interface LedgerResult {
  karigar: {
    id: string;
    name: string;
    phone: string;
    photoUrl: string | null;
    address: string | null;
  };
  entries: LedgerEntry[];
  summary: LedgerSummary;
  dateRange: {
    from: Date | null;
    to: Date | null;
  };
}
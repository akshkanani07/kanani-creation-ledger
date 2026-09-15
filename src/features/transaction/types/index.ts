/**
 * Transaction Types
 * 
 * Type definitions for the Transaction feature.
 * Derived from Prisma schema + extended for UI needs.
 * 
 * USAGE:
 *   import type { Transaction, TransactionInput } from "@/features/transaction/types";
 */

// ═══════════════════════════════════════════════════════════
// ENUMS (Match Prisma Schema)
// ═══════════════════════════════════════════════════════════

export type TransactionType =
  | "OPENING_BALANCE"
  | "WORK"
  | "PAYMENT"
  | "ADVANCE"
  | "DEDUCTION";

export type TransactionDirection = "CREDIT" | "DEBIT";

export type PaymentMode =
  | "CASH"
  | "UPI"
  | "BANK_TRANSFER"
  | "CHEQUE"
  | "OTHER";

// ═══════════════════════════════════════════════════════════
// CORE TYPES
// ═══════════════════════════════════════════════════════════

/**
 * Transaction — Full entity from database.
 */
export interface Transaction {
  id: string;
  karigarId: string;
  type: TransactionType;
  direction: TransactionDirection;
  amount: number;
  quantity: number | null;
  rate: number | null;
  paymentMode: PaymentMode | null;
  reference: string | null;
  description: string;
  transactionDate: Date;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Transaction with karigar info (for list views).
 */
export interface TransactionWithKarigar extends Transaction {
  karigar: {
    id: string;
    name: string;
    phone: string;
    photoUrl: string | null;
  };
}

/**
 * Transaction form input (create/update).
 */
export interface TransactionInput {
  karigarId: string;
  type: TransactionType;
  direction?: TransactionDirection; // Optional — auto-derived from type
  amount: number;
  quantity?: number;
  rate?: number;
  paymentMode?: PaymentMode;
  reference?: string;
  description: string;
  transactionDate?: Date;
}

/**
 * Transaction update input (all fields optional except id).
 */
export type TransactionUpdateInput = Partial<TransactionInput> & {
  id: string;
};

// ═══════════════════════════════════════════════════════════
// FILTER TYPES
// ═══════════════════════════════════════════════════════════

export interface TransactionFilters {
  /** Filter by specific karigar */
  karigarId?: string;
  /** Filter by transaction type */
  type?: TransactionType;
  /** Filter by direction */
  direction?: TransactionDirection;
  /** Search in description or reference */
  search?: string;
  /** Date range (inclusive) */
  dateFrom?: Date;
  dateTo?: Date;
  /** Pagination */
  page?: number;
  limit?: number;
  /** Sort */
  sortBy?: "date" | "amount" | "createdAt";
  sortOrder?: "asc" | "desc";
}

// ═══════════════════════════════════════════════════════════
// SUMMARY TYPES
// ═══════════════════════════════════════════════════════════

/**
 * Transaction summary for a karigar (used in ledger).
 */
export interface TransactionSummary {
  totalCredit: number;
  totalDebit: number;
  balance: number;
  count: number;
}

/**
 * Type distribution for reports.
 */
export interface TypeDistribution {
  type: TransactionType;
  count: number;
  totalAmount: number;
}

// ═══════════════════════════════════════════════════════════
// OPTION TYPES
// ═══════════════════════════════════════════════════════════

/**
 * Transaction type option for form selectors.
 */
export interface TransactionTypeOption {
  value: TransactionType;
  label: string;
  description: string;
  direction: TransactionDirection;
  icon: string; // Lucide icon name
}
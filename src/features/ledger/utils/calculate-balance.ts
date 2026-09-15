/**
 * Running Balance Calculator
 * 
 * Computes running balance from a list of transactions.
 * Uses cumulative sum: balance = Σ(CREDIT) − Σ(DEBIT)
 * 
 * USAGE:
 *   const entries = calculateRunningBalance(transactions);
 */

import type { LedgerEntry, LedgerSummary } from "../types";
import type { TransactionDirection } from "@/config/constants";

// ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════

interface RawTransaction {
  id: string;
  transactionDate: Date;
  type: string;
  direction: TransactionDirection;
  amount: unknown; // Prisma Decimal
  description: string;
  reference: string | null;
  paymentMode: string | null;
  quantity: unknown;
  rate: unknown;
}

// ═══════════════════════════════════════════════════════════
// CALCULATE RUNNING BALANCE
// ═══════════════════════════════════════════════════════════

/**
 * Calculates running balance for a list of transactions.
 * 
 * IMPORTANT: Transactions must be sorted by date ASC (oldest first).
 * 
 * @param transactions - Sorted transactions
 * @param startingBalance - Balance BEFORE the first transaction (default 0)
 * @returns Ledger entries with running balance
 */
export function calculateRunningBalance(
  transactions: RawTransaction[],
  startingBalance = 0
): LedgerEntry[] {
  let balance = startingBalance;

  return transactions.map((tx) => {
    const amount = Number(tx.amount);

    // Update running balance
    if (tx.direction === "CREDIT") {
      balance += amount;
    } else {
      balance -= amount;
    }

    return {
      id: tx.id,
      date: tx.transactionDate,
      type: tx.type as LedgerEntry["type"],
      direction: tx.direction,
      amount,
      description: tx.description,
      reference: tx.reference,
      paymentMode: tx.paymentMode,
      quantity: tx.quantity ? Number(tx.quantity) : null,
      rate: tx.rate ? Number(tx.rate) : null,
      runningBalance: balance,
    };
  });
}

// ═══════════════════════════════════════════════════════════
// CALCULATE SUMMARY
// ═══════════════════════════════════════════════════════════

/**
 * Calculates summary from ledger entries.
 */
export function calculateLedgerSummary(
  entries: LedgerEntry[],
  openingBalance = 0
): LedgerSummary {
  const totalCredit = entries
    .filter((e) => e.direction === "CREDIT")
    .reduce((sum, e) => sum + e.amount, 0);

  const totalDebit = entries
    .filter((e) => e.direction === "DEBIT")
    .reduce((sum, e) => sum + e.amount, 0);

  const closingBalance =
    entries.length > 0
      ? entries[entries.length - 1].runningBalance
      : openingBalance;

  return {
    openingBalance,
    totalCredit,
    totalDebit,
    closingBalance,
    totalEntries: entries.length,
  };
}

// ═══════════════════════════════════════════════════════════
// FORMAT HELPERS
// ═══════════════════════════════════════════════════════════

/**
 * Checks if balance is settled (within ₹0.01 tolerance).
 */
export function isSettled(balance: number): boolean {
  return Math.abs(balance) < 0.01;
}

/**
 * Returns balance direction label ("CR" or "DR").
 */
export function getBalanceLabel(balance: number): "CR" | "DR" | "SETTLED" {
  if (isSettled(balance)) return "SETTLED";
  return balance > 0 ? "CR" : "DR";
}
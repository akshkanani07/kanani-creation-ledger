/**
 * Currency Formatting Utilities
 * 
 * Domain-specific helpers for Indian currency formatting.
 * Handles rupee amounts, parsing, and calculations.
 * 
 * WHY SEPARATE FROM lib/utils.ts:
 * - Currency is business-domain specific
 * - Reusable across Karigar, Transaction, Ledger, Reports
 * - Future: Multi-currency support can extend this
 * 
 * USAGE:
 *   import { formatAmount, parseAmount, calculateBalance } from "@/utils/format-currency";
 */

import { CURRENCY } from "@/config/constants";

// ============================================================
// FORMATTING
// ============================================================

/**
 * Formats a number as Indian Rupees with symbol (e.g., ₹1,23,456.50).
 * 
 * @param amount - Amount to format
 * @param options - Formatting options
 * @returns Formatted currency string
 * 
 * @example
 *   formatAmount(123456)              // → "₹1,23,456"
 *   formatAmount(123456.5)            // → "₹1,23,456.50"
 *   formatAmount(123456.5, { decimals: 0 })  // → "₹1,23,456"
 *   formatAmount(-500)                // → "-₹500"
 *   formatAmount(0)                   // → "₹0"
 */
export function formatAmount(
  amount: number,
  options?: {
    decimals?: number;
    showSymbol?: boolean;
  }
): string {
  const { decimals = 0, showSymbol = true } = options ?? {};

  if (!isFinite(amount)) return showSymbol ? `${CURRENCY.SYMBOL}0` : "0";

  const absAmount = Math.abs(amount);
  const formatted = new Intl.NumberFormat(CURRENCY.LOCALE, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(absAmount);

  const symbol = showSymbol ? CURRENCY.SYMBOL : "";
  const sign = amount < 0 ? "-" : "";

  return `${sign}${symbol}${formatted}`;
}

/**
 * Formats a large amount as compact currency (₹1.2L, ₹15K, ₹1.5Cr).
 * Useful for dashboard cards where space is limited.
 * 
 * @example
 *   formatAmountCompact(123456)      // → "₹1.23L"
 *   formatAmountCompact(15000)       // → "₹15.0K"
 *   formatAmountCompact(15000000)    // → "₹1.50Cr"
 */
export function formatAmountCompact(amount: number): string {
  const absAmount = Math.abs(amount);
  const sign = amount < 0 ? "-" : "";
  const symbol = CURRENCY.SYMBOL;

  if (absAmount >= 10_000_000) {
    return `${sign}${symbol}${(absAmount / 10_000_000).toFixed(2)}Cr`;
  }
  if (absAmount >= 100_000) {
    return `${sign}${symbol}${(absAmount / 100_000).toFixed(2)}L`;
  }
  if (absAmount >= 1_000) {
    return `${sign}${symbol}${(absAmount / 1_000).toFixed(1)}K`;
  }
  return `${sign}${symbol}${absAmount}`;
}

/**
 * Formats amount with explicit CR/DR suffix for ledger displays.
 * 
 * @example
 *   formatAmountWithDirection(500, "CREDIT")    // → "₹500 Cr"
 *   formatAmountWithDirection(500, "DEBIT")     // → "₹500 Dr"
 */
export function formatAmountWithDirection(
  amount: number,
  direction: "CREDIT" | "DEBIT"
): string {
  const suffix = direction === "CREDIT" ? "Cr" : "Dr";
  return `${formatAmount(amount)} ${suffix}`;
}

// ============================================================
// PARSING
// ============================================================

/**
 * Parses a formatted currency string back to a number.
 * Removes symbols, commas, and spaces.
 * 
 * @example
 *   parseAmount("₹1,23,456")   // → 123456
 *   parseAmount("1234.56")     // → 1234.56
 *   parseAmount("")            // → 0
 *   parseAmount("abc")         // → 0
 */
export function parseAmount(value: string | number): number {
  if (typeof value === "number") return isFinite(value) ? value : 0;
  if (!value) return 0;

  const cleaned = value.replace(/[₹,\s]/g, "");
  const parsed = parseFloat(cleaned);

  return isFinite(parsed) ? parsed : 0;
}

// ============================================================
// CALCULATIONS
// ============================================================

/**
 * Calculates the net balance from transactions.
 * 
 * Formula: balance = sum(CREDIT) - sum(DEBIT)
 * 
 * @example
 *   calculateBalance([
 *     { amount: 500, direction: "CREDIT" },
 *     { amount: 300, direction: "DEBIT" },
 *   ])  // → 200
 */
export function calculateBalance(
  transactions: Array<{ amount: number; direction: "CREDIT" | "DEBIT" }>
): number {
  return transactions.reduce((balance, tx) => {
    return tx.direction === "CREDIT"
      ? balance + tx.amount
      : balance - tx.amount;
  }, 0);
}

/**
 * Checks if a balance is settled (within ₹0.01 tolerance).
 * Handles floating-point precision issues.
 * 
 * @example
 *   isSettled(0)         // → true
 *   isSettled(0.005)     // → true
 *   isSettled(100)       // → false
 */
export function isSettled(balance: number): boolean {
  return Math.abs(balance) < 0.01;
}

/**
 * Rounds an amount to 2 decimal places (standard currency).
 * Avoids floating-point artifacts like 100.00000001.
 * 
 * @example
 *   roundAmount(100.005)   // → 100.01
 *   roundAmount(99.999)    // → 100
 */
export function roundAmount(amount: number): number {
  return Math.round(amount * 100) / 100;
}
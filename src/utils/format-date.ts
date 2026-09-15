/**
 * Date Formatting Utilities
 * 
 * Domain-specific date helpers for the ledger application.
 * All dates use India timezone (Asia/Kolkata) by default.
 * 
 * USAGE:
 *   import { formatLedgerDate, isToday, getFinancialYear } from "@/utils/format-date";
 */

import { DATE_FORMATS } from "@/config/constants";

// ============================================================
// BASIC FORMATTING
// ============================================================

/**
 * Formats a date for display (e.g., "15 Sep 2026").
 */
export function formatDisplayDate(date: Date | string | number): string {
  return format(date, DATE_FORMATS.DISPLAY);
}

/**
 * Formats a date for PDF export (e.g., "15/09/2026").
 */
export function formatPdfDate(date: Date | string | number): string {
  return format(date, DATE_FORMATS.PDF);
}

/**
 * Formats a date for HTML input (e.g., "2026-09-15").
 */
export function formatInputDate(date: Date | string | number): string {
  return format(date, DATE_FORMATS.INPUT);
}

/**
 * Formats a date for file names (e.g., "2026-09-15").
 */
export function formatFileDate(date: Date | string | number = new Date()): string {
  return format(date, DATE_FORMATS.FILE_NAME);
}

// ============================================================
// CORE FORMATTER (Internal)
// ============================================================

function format(date: Date | string | number, pattern: string): string {
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return "—";

  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];

  const pad = (n: number) => String(n).padStart(2, "0");
  const day = pad(d.getDate());
  const month = pad(d.getMonth() + 1);
  const year = String(d.getFullYear());

  return pattern
    .replace("yyyy", year)
    .replace("MMM", months[d.getMonth()])
    .replace("MM", month)
    .replace("dd", day);
}

// ============================================================
// LOGICAL CHECKS
// ============================================================

/**
 * Checks if a date is today.
 * 
 * @example
 *   isToday(new Date())              // → true
 *   isToday("2020-01-01")            // → false
 */
export function isToday(date: Date | string | number): boolean {
  const d = new Date(date);
  const today = new Date();
  return (
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear()
  );
}

/**
 * Checks if a date is in the future.
 */
export function isFuture(date: Date | string | number): boolean {
  return new Date(date).getTime() > Date.now();
}

/**
 * Checks if a date is in the past.
 */
export function isPast(date: Date | string | number): boolean {
  return new Date(date).getTime() < Date.now();
}

// ============================================================
// INDIAN FINANCIAL YEAR
// ============================================================

/**
 * Returns the Indian Financial Year (April 1 – March 31) for a date.
 * 
 * @example
 *   getFinancialYear("2026-09-15")  // → "2026-27"
 *   getFinancialYear("2026-03-15")  // → "2025-26"
 *   getFinancialYear("2026-04-01")  // → "2026-27"
 */
export function getFinancialYear(date: Date | string | number = new Date()): string {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = d.getMonth() + 1; // 1-12

  // April (4) to December (12) → Current Year to Next Year
  // January (1) to March (3) → Previous Year to Current Year
  const startYear = month >= 4 ? year : year - 1;
  const endYear = String(startYear + 1).slice(-2);

  return `${startYear}-${endYear}`;
}

/**
 * Returns the start date of the Indian Financial Year.
 */
export function getFinancialYearStart(date: Date | string | number = new Date()): Date {
  const d = new Date(date);
  const month = d.getMonth() + 1;
  const startYear = month >= 4 ? d.getFullYear() : d.getFullYear() - 1;
  return new Date(startYear, 3, 1); // April 1
}

// ============================================================
// MONTH HELPERS
// ============================================================

/**
 * Returns the start of a day (00:00:00).
 */
export function startOfDay(date: Date | string | number): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Returns the end of a day (23:59:59.999).
 */
export function endOfDay(date: Date | string | number): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

/**
 * Returns the start of a month.
 */
export function startOfMonth(date: Date | string | number = new Date()): Date {
  const d = new Date(date);
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

/**
 * Returns the end of a month.
 */
export function endOfMonth(date: Date | string | number = new Date()): Date {
  const d = new Date(date);
  return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
}
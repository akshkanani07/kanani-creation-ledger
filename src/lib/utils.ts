/**
 * Core Utility Functions
 * 
 * Centralized reusable utilities.
 * Required by Shadcn UI (cn) + App-wide formatting.
 * 
 * USAGE:
 *   import { cn, formatCurrency, formatRelativeTime } from "@/lib/utils";
 */

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { CURRENCY, DATE_FORMATS } from "@/config/constants";

// ============================================================
// TAILWIND CLASS MERGE (Required by Shadcn UI)
// ============================================================

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// ============================================================
// CURRENCY FORMATTING
// ============================================================

/**
 * Formats a number as Indian currency (e.g., ₹1,23,456).
 * 
 * @example
 *   formatCurrency(123456)        // → "₹1,23,456"
 *   formatCurrency(123456.5)      // → "₹1,23,457" (default 0 decimals)
 *   formatCurrency(-500)          // → "-₹500"
 *   formatCurrency(1000, { showSymbol: false }) // → "1,000"
 */
export function formatCurrency(
  amount: number,
  options?: {
    showSymbol?: boolean;
    decimals?: number;
  }
): string {
  const { showSymbol = true, decimals = 0 } = options ?? {};

  const formatted = new Intl.NumberFormat(CURRENCY.LOCALE, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(Math.abs(amount));

  const symbol = showSymbol ? CURRENCY.SYMBOL : "";
  const sign = amount < 0 ? "-" : "";

  return `${sign}${symbol}${formatted}`;
}

/**
 * Compact currency format (₹1.2L, ₹15K, ₹1.5Cr).
 */
export function formatCurrencyCompact(amount: number): string {
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

// ============================================================
// DATE FORMATTING
// ============================================================

/**
 * Formats a date using a standard preset.
 */
export function formatDate(
  date: Date | string | number,
  format: keyof typeof DATE_FORMATS = "DISPLAY"
): string {
  const d = new Date(date);
  if (isNaN(d.getTime())) return "—";
  return formatDateWithPattern(d, DATE_FORMATS[format]);
}

export function formatDateWithPattern(date: Date, pattern: string): string {
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  const monthsFull = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  const day = date.getDate();
  const month = date.getMonth();
  const year = date.getFullYear();

  const hours24 = date.getHours();
  const hours12 = hours24 % 12 || 12;
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();
  const ampm = hours24 >= 12 ? "PM" : "AM";

  const pad = (n: number) => String(n).padStart(2, "0");

  const replacements: Record<string, string> = {
    yyyy: String(year),
    MMMM: monthsFull[month],
    MMM: months[month],
    MM: pad(month + 1),
    dd: pad(day),
    HH: pad(hours24),
    hh: pad(hours12),
    mm: pad(minutes),
    ss: pad(seconds),
    a: ampm,
  };

  let result = pattern;
  const tokens = Object.keys(replacements).sort((a, b) => b.length - a.length);
  for (const token of tokens) {
    result = result.replace(new RegExp(token, "g"), replacements[token]);
  }

  return result;
}

export function formatDateTime(date: Date | string | number): string {
  return formatDate(date, "DISPLAY_WITH_TIME");
}

/**
 * Relative time formatting (e.g., "2 hours ago").
 */
export function formatRelativeTime(date: Date | string | number): string {
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return "just now";
  if (diffMin < 60) return `${diffMin} min ago`;
  if (diffHour < 24) return `${diffHour} hour${diffHour > 1 ? "s" : ""} ago`;
  if (diffDay < 30) return `${diffDay} day${diffDay > 1 ? "s" : ""} ago`;

  return formatDate(d);
}

// ============================================================
// STRING HELPERS
// ============================================================

export function getInitials(name: string): string {
  if (!name || name.trim().length === 0) return "?";

  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + "…";
}

export function toTitleCase(text: string): string {
  return text
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// ============================================================
// VALIDATION HELPERS
// ============================================================

export function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === "string") return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === "object") return Object.keys(value).length === 0;
  return false;
}

// ============================================================
// ASYNC HELPERS
// ============================================================

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
/**
 * Application Constants
 * 
 * Central location for all application-wide constants.
 * This includes transaction types, payment modes, routes, and configuration values.
 * 
 * WHY THIS FILE EXISTS:
 * - Avoids magic strings scattered across the codebase
 * - Single source of truth for enums and fixed values
 * - Type-safe with TypeScript `as const`
 * - Easy to update without hunting through files
 */

// ============================================================
// TRANSACTION TYPES
// ============================================================

/**
 * All transaction types supported in the ledger.
 * 
 * Each type represents a different kind of entry in a karigar's account.
 * The `direction` determines whether the amount increases or decreases
 * the karigar's balance.
 */
export const TRANSACTION_TYPES = {
  OPENING_BALANCE: "OPENING_BALANCE",
  WORK: "WORK",
  PAYMENT: "PAYMENT",
  ADVANCE: "ADVANCE",
  DEDUCTION: "DEDUCTION",
} as const;

export type TransactionType =
  (typeof TRANSACTION_TYPES)[keyof typeof TRANSACTION_TYPES];

/**
 * Human-readable labels for transaction types.
 * Used in UI dropdowns, tables, and PDF reports.
 */
export const TRANSACTION_TYPE_LABELS: Record<TransactionType, string> = {
  OPENING_BALANCE: "Opening Balance",
  WORK: "Work",
  PAYMENT: "Payment",
  ADVANCE: "Advance",
  DEDUCTION: "Deduction",
};

/**
 * Description/helper text for each transaction type.
 * Shown below the type selector in transaction form.
 */
export const TRANSACTION_TYPE_DESCRIPTIONS: Record<TransactionType, string> = {
  OPENING_BALANCE: "Initial balance when karigar is added",
  WORK: "Work completed by karigar (amount payable)",
  PAYMENT: "Payment made to karigar",
  ADVANCE: "Advance given to karigar",
  DEDUCTION: "Amount deducted from karigar's payment",
};

// ============================================================
// TRANSACTION DIRECTIONS
// ============================================================

/**
 * Direction of a transaction's effect on karigar's balance.
 * 
 * CREDIT: Increases what we owe the karigar (Work, Opening Debit)
 * DEBIT:  Decreases what we owe the karigar (Payment, Advance, Deduction)
 * 
 * FORMULA: balance = sum(CREDIT) - sum(DEBIT)
 */
export const TRANSACTION_DIRECTIONS = {
  CREDIT: "CREDIT",
  DEBIT: "DEBIT",
} as const;

export type TransactionDirection =
  (typeof TRANSACTION_DIRECTIONS)[keyof typeof TRANSACTION_DIRECTIONS];

/**
 * Maps each transaction type to its default direction.
 * 
 * NOTE: OPENING_BALANCE direction depends on whether the karigar
 * already owes us or we owe them. It's set manually during entry.
 * Default is CREDIT (we owe karigar) — most common case.
 */
export const TRANSACTION_TYPE_DEFAULT_DIRECTION: Record<
  TransactionType,
  TransactionDirection
> = {
  OPENING_BALANCE: "CREDIT",
  WORK: "CREDIT",
  PAYMENT: "DEBIT",
  ADVANCE: "DEBIT",
  DEDUCTION: "DEBIT",
};

// ============================================================
// PAYMENT MODES
// ============================================================

/**
 * Payment modes available for PAYMENT and ADVANCE transactions.
 * Stored as optional metadata on the transaction.
 */
export const PAYMENT_MODES = {
  CASH: "CASH",
  UPI: "UPI",
  BANK_TRANSFER: "BANK_TRANSFER",
  CHEQUE: "CHEQUE",
  OTHER: "OTHER",
} as const;

export type PaymentMode = (typeof PAYMENT_MODES)[keyof typeof PAYMENT_MODES];

export const PAYMENT_MODE_LABELS: Record<PaymentMode, string> = {
  CASH: "Cash",
  UPI: "UPI",
  BANK_TRANSFER: "Bank Transfer",
  CHEQUE: "Cheque",
  OTHER: "Other",
};

// ============================================================
// APP ROUTES
// ============================================================

/**
 * All application routes in one place.
 * Use these instead of hardcoding paths in components.
 */
export const ROUTES = {
  // Public routes
  LOGIN: "/login",
  LOGIN_VERIFY: "/login/verify",

  // Protected routes (Dashboard)
  DASHBOARD: "/dashboard",
  KARIGAR: "/karigar",
  KARIGAR_NEW: "/karigar/new",
  KARIGAR_DETAIL: (id: string) => `/karigar/${id}`,
  KARIGAR_EDIT: (id: string) => `/karigar/${id}/edit`,

  TRANSACTIONS: "/transactions",
  TRANSACTION_NEW: "/transactions/new",
  TRANSACTION_EDIT: (id: string) => `/transactions/${id}/edit`,

  LEDGER: "/ledger",
  LEDGER_DETAIL: (karigarId: string) => `/ledger/${karigarId}`,

  REPORTS: "/reports",
  SETTINGS: "/settings",
} as const;

// ============================================================
// PAGINATION
// ============================================================

/**
 * Pagination defaults for lists (transactions, karigars, activity logs).
 * Mobile-first: smaller page size for faster loading.
 */
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
  KARIGAR_LIMIT: 20,
  TRANSACTION_LIMIT: 30,
  ACTIVITY_LOG_LIMIT: 50,
} as const;

// ============================================================
// DATE & TIME
// ============================================================

/**
 * Standard date formats used throughout the app.
 * Uses date-fns format tokens.
 */
export const DATE_FORMATS = {
  DISPLAY: "dd MMM yyyy",          // 15 Sep 2026
  DISPLAY_LONG: "dd MMMM yyyy",    // 15 September 2026
  DISPLAY_WITH_TIME: "dd MMM yyyy, hh:mm a",
  INPUT: "yyyy-MM-dd",             // HTML date input
  PDF: "dd/MM/yyyy",               // Indian format for PDF
  MONTH_YEAR: "MMM yyyy",          // Sep 2026
  FILE_NAME: "yyyy-MM-dd",         // For export file names
} as const;

// ============================================================
// CURRENCY
// ============================================================

/**
 * Currency configuration for Indian Rupees.
 * Uses `en-IN` locale for Indian number formatting (1,23,456).
 */
export const CURRENCY = {
  CODE: "INR",
  SYMBOL: "₹",
  LOCALE: "en-IN",
  MIN_DECIMALS: 0,
  MAX_DECIMALS: 2,
} as const;

// ============================================================
// QUERY KEYS (TanStack Query)
// ============================================================

/**
 * Centralized query keys for TanStack Query.
 * Prevents typos and makes cache invalidation predictable.
 */
export const QUERY_KEYS = {
  SESSION: ["session"] as const,
  
  KARIGARS: ["karigars"] as const,
  KARIGAR: (id: string) => ["karigars", id] as const,
  
  TRANSACTIONS: ["transactions"] as const,
  TRANSACTION: (id: string) => ["transactions", id] as const,
  
  LEDGER: (karigarId: string) => ["ledger", karigarId] as const,
  
  DASHBOARD_STATS: ["dashboard", "stats"] as const,
  
  REPORT: (filters: unknown) => ["report", filters] as const,
  
  ACTIVITY_LOGS: ["activity-logs"] as const,
} as const;

// ============================================================
// FILE UPLOAD
// ============================================================

/**
 * File upload constraints for Karigar photos.
 * Max 5MB before compression, output max 500KB.
 */
export const UPLOAD = {
  MAX_FILE_SIZE: 5 * 1024 * 1024,     // 5 MB
  ALLOWED_IMAGE_TYPES: ["image/jpeg", "image/png", "image/webp"],
  MAX_IMAGE_WIDTH: 1200,
  MAX_IMAGE_HEIGHT: 1200,
  COMPRESSION_QUALITY: 0.85,
  CLOUDINARY_FOLDER: "kanani-creation/karigars",
} as const;

// ============================================================
// SESSION
// ============================================================

/**
 * Session and security configuration.
 * Auto-logout after inactivity for security.
 */
export const SESSION = {
  MAX_AGE_DAYS: 7,
  INACTIVITY_TIMEOUT_MINUTES: 30,
  WARNING_BEFORE_LOGOUT_MINUTES: 2,
} as const;

// ============================================================
// VALIDATION
// ============================================================

/**
 * Common validation limits used in Zod schemas.
 */
export const VALIDATION = {
  NAME_MIN: 2,
  NAME_MAX: 100,
  PHONE_LENGTH: 10,           // Indian mobile number
  AMOUNT_MAX: 99_99_99_999,   // ₹99,99,99,999
  DESCRIPTION_MAX: 500,
  ADDRESS_MAX: 300,
  NOTE_MAX: 1000,
} as const;

// ============================================================
// APP METADATA
// ============================================================

/**
 * App-wide metadata constants.
 */
export const APP = {
  NAME: "Kanani Creation Ledger",
  SHORT_NAME: "KC Ledger",
  VERSION: "1.0.0",
  DEFAULT_LOCALE: "en-IN",
  DEFAULT_TIMEZONE: "Asia/Kolkata",
} as const;
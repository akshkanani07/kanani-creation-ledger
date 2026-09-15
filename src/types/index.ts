/**
 * Types Barrel Export
 * 
 * Central export point for all global types.
 * Feature-specific types live in their own folders.
 * 
 * USAGE:
 *   import type { ApiResponse, PaginatedResponse, FormState } from "@/types";
 */

// ============================================================
// COMMON TYPES
// ============================================================

export type {
  // API
  ApiResponse,
  PaginatedResponse,
  Pagination,
  
  // Async
  AsyncState,
  FormState,
  
  // IDs
  EntityId,
  Cuid,
  
  // Utilities
  PartialBy,
  RequiredBy,
  ArrayElement,
  NonNullableFields,
  
  // Database
  SoftDeletable,
  Auditable,
  BaseEntity,
  
  // Filters
  DateRange,
  SortDirection,
  SortConfig,
  SelectOption,
} from "./common";

// ============================================================
// FEATURE TYPES (Future)
// ============================================================

/**
 * Feature-specific types are added here as they are created.
 * 
 * Coming in future steps:
 *   export type { Karigar, KarigarInput } from "@/features/karigar/types";
 *   export type { Transaction, TransactionInput } from "@/features/transaction/types";
 *   export type { LedgerEntry } from "@/features/ledger/types";
 *   export type { ActivityLog } from "@/features/settings/types";
 *   export type { DashboardStats } from "@/features/dashboard/types";
 *   export type { ReportFilters } from "@/features/report/types";
 */

// ============================================================
// RE-EXPORT FROM CONFIG
// ============================================================

/**
 * Convenience re-exports of commonly used types from config.
 */
export type {
  TransactionType,
  TransactionDirection,
  PaymentMode,
} from "@/config/constants";
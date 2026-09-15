/**
 * Common TypeScript Types
 * 
 * Shared types used across the application.
 * These are generic and feature-agnostic — reusable everywhere.
 * 
 * WHY THIS FILE EXISTS:
 * - Centralizes common type definitions
 * - Ensures consistency across API responses
 * - Type-safe wrappers for async operations
 * 
 * USAGE:
 *   import type { ApiResponse, PaginatedResponse } from "@/types/common";
 */

// ============================================================
// API RESPONSE TYPES
// ============================================================

/**
 * Standard API response wrapper for Server Actions.
 * Every Server Action should return this shape.
 * 
 * @example
 *   return { success: true, data: karigar };
 *   return { success: false, error: "Karigar not found" };
 */
export type ApiResponse<T = void> =
  | { success: true; data: T; message?: string }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

/**
 * Paginated API response.
 * Used for lists (karigars, transactions, activity logs).
 */
export type PaginatedResponse<T> = {
  items: T[];
  pagination: Pagination;
};

/**
 * Pagination metadata.
 */
export type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
};

// ============================================================
// ASYNC STATE TYPES
// ============================================================

/**
 * Generic async state for managing loading/error/data states.
 * Useful for custom hooks that don't use TanStack Query.
 * 
 * @example
 *   const [state, setState] = useState<AsyncState<Karigar>>({ 
 *     status: "idle", data: null, error: null 
 *   });
 */
export type AsyncState<T> = {
  status: "idle" | "loading" | "success" | "error";
  data: T | null;
  error: string | null;
};

// ============================================================
// ID TYPES
// ============================================================

/**
 * Branded type for entity IDs.
 * Prevents accidentally passing wrong ID type.
 * 
 * Note: Currently just aliases to string. Can be enhanced later
 * with branded types if needed.
 */
export type EntityId = string;

/**
 * CUID (Collision-resistant Unique Identifier).
 * All database IDs are CUIDs.
 */
export type Cuid = string;

// ============================================================
// UTILITY TYPES
// ============================================================

/**
 * Makes specific keys optional in a type.
 * 
 * @example
 *   type User = { id: string; name: string; email: string };
 *   type UserUpdate = PartialBy<User, "name" | "email">;
 *   // → { id: string; name?: string; email?: string }
 */
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Makes specific keys required in a type.
 */
export type RequiredBy<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

/**
 * Extracts the type of array elements.
 * 
 * @example
 *   type Karigars = Karigar[];
 *   type Karigar = ArrayElement<Karigars>;  // → Karigar
 */
export type ArrayElement<A> = A extends readonly (infer T)[] ? T : never;

/**
 * Non-nullable version of a type.
 */
export type NonNullableFields<T> = {
  [P in keyof T]: NonNullable<T[P]>;
};

// ============================================================
// DATABASE TYPES
// ============================================================

/**
 * Soft delete metadata fields.
 * Every soft-deletable entity has these.
 */
export type SoftDeletable = {
  deletedAt: Date | null;
};

/**
 * Audit metadata fields.
 * Every entity has these for tracking.
 */
export type Auditable = {
  createdAt: Date;
  updatedAt: Date;
};

/**
 * Combined base entity fields.
 * Soft-delete + Audit + ID.
 */
export type BaseEntity = {
  id: EntityId;
} & Auditable & SoftDeletable;

// ============================================================
// FORM TYPES
// ============================================================

/**
 * Form submission state.
 * Used with React Hook Form + Server Actions.
 */
export type FormState = {
  status: "idle" | "submitting" | "success" | "error";
  message: string | null;
  fieldErrors?: Record<string, string[]>;
};

// ============================================================
// DATE RANGE
// ============================================================

/**
 * Date range for filtering (reports, ledger).
 * 
 * @example
 *   const range: DateRange = {
 *     from: new Date("2026-04-01"),
 *     to: new Date("2026-09-30"),
 *   };
 */
export type DateRange = {
  from: Date | null;
  to: Date | null;
};

// ============================================================
// SORT
// ============================================================

/**
 * Sort direction.
 */
export type SortDirection = "asc" | "desc";

/**
 * Sort configuration.
 */
export type SortConfig<TField extends string = string> = {
  field: TField;
  direction: SortDirection;
};

// ============================================================
// SELECT OPTION
// ============================================================

/**
 * Generic select/dropdown option.
 * Used in forms and filters.
 */
export type SelectOption<T = string> = {
  label: string;
  value: T;
  disabled?: boolean;
  description?: string;
};
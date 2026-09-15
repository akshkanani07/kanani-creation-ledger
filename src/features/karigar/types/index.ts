/**
 * Karigar Types
 * 
 * Type definitions specific to the Karigar feature.
 * Derived from Prisma schema + extended for UI needs.
 * 
 * USAGE:
 *   import type { Karigar, KarigarInput } from "@/features/karigar/types";
 */

// ═══════════════════════════════════════════════════════════
// CORE TYPES
// ═══════════════════════════════════════════════════════════

/**
 * Karigar — Full entity from database.
 */
export interface Karigar {
  id: string;
  name: string;
  phone: string;
  address: string | null;
  photoUrl: string | null;
  photoId: string | null;
  isActive: boolean;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Karigar with computed balance (from transactions).
 * Used in list views and detail pages.
 */
export interface KarigarWithBalance extends Karigar {
  balance: number;
  totalCredit: number;
  totalDebit: number;
  transactionCount: number;
}

/**
 * Karigar form input (create/update).
 * Matches Zod schema output.
 */
export interface KarigarInput {
  name: string;
  phone: string;
  address?: string;
  photoUrl?: string;
  photoId?: string;
   openingBalance?: number;
  isActive?: boolean;
}

/**
 * Karigar update input (all fields optional).
 */
export type KarigarUpdateInput = Partial<KarigarInput> & {
  id: string;
};

// ═══════════════════════════════════════════════════════════
// FILTER TYPES
// ═══════════════════════════════════════════════════════════

export interface KarigarFilters {
  /** Search by name or phone */
  search?: string;
  /** Filter by active status */
  isActive?: boolean;
  /** Include soft-deleted (default: false) */
  includeDeleted?: boolean;
  /** Sort field */
  sortBy?: "name" | "balance" | "createdAt";
  /** Sort direction */
  sortOrder?: "asc" | "desc";
  /** Pagination */
  page?: number;
  limit?: number;
}

// ═══════════════════════════════════════════════════════════
// OPTION TYPES
// ═══════════════════════════════════════════════════════════

/**
 * Simplified Karigar option for dropdowns/selects.
 */
export interface KarigarOption {
  value: string;
  label: string;
  phone: string;
  balance: number;
}
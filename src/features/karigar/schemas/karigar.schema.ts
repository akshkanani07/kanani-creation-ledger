/**
 * Karigar Validation Schemas
 * 
 * Zod schemas for form validation + server-side validation.
 * Used by React Hook Form + Server Actions.
 * 
 * FEATURES:
 * - Name: 2-100 chars, Unicode support
 * - Phone: 10-digit Indian mobile (auto-normalized)
 * - Opening Balance: Optional (default 0)
 * - Photo: Optional Cloudinary
 */

import { z } from "zod";
import { VALIDATION } from "@/config/constants";
import { normalizePhone } from "@/utils/format-phone";

// ═══════════════════════════════════════════════════════════
// BASE SCHEMA
// ═══════════════════════════════════════════════════════════

export const karigarSchema = z.object({
  // ─────────────────────────────────────────────
  // NAME
  // ─────────────────────────────────────────────
  name: z
    .string()
    .trim()
    .min(
      VALIDATION.NAME_MIN,
      `Name must be at least ${VALIDATION.NAME_MIN} characters`
    )
    .max(
      VALIDATION.NAME_MAX,
      `Name must be less than ${VALIDATION.NAME_MAX} characters`
    )
    .regex(
      /^[\p{L}\s.\-']+$/u,
      "Name can only contain letters, spaces, dots, hyphens, and apostrophes"
    ),

  // ─────────────────────────────────────────────
  // PHONE
  // ─────────────────────────────────────────────
  phone: z
    .string()
    .trim()
    .min(1, "Phone number is required")
    .transform((val) => normalizePhone(val))
    .refine(
      (val) => /^[6-9]\d{9}$/.test(val),
      "Enter a valid 10-digit Indian mobile number"
    ),

  // ─────────────────────────────────────────────
  // ADDRESS (Optional)
  // ─────────────────────────────────────────────
  address: z
    .string()
    .trim()
    .max(
      VALIDATION.ADDRESS_MAX,
      `Address must be less than ${VALIDATION.ADDRESS_MAX} characters`
    )
    .optional()
    .or(z.literal(""))
    .transform((val) => (val === "" ? undefined : val)),

  // ─────────────────────────────────────────────
  // PHOTO (Optional)
  // ─────────────────────────────────────────────
  photoUrl: z
    .string()
    .url("Photo URL must be valid")
    .optional()
    .or(z.literal(""))
    .transform((val) => (val === "" ? undefined : val)),

  photoId: z
    .string()
    .optional()
    .or(z.literal(""))
    .transform((val) => (val === "" ? undefined : val)),

  // ─────────────────────────────────────────────
  // OPENING BALANCE (Optional — default 0)
  // ─────────────────────────────────────────────
  openingBalance: z.coerce
    .number()
    .min(0, "Opening balance cannot be negative")
    .max(
      VALIDATION.AMOUNT_MAX,
      `Amount cannot exceed ₹${VALIDATION.AMOUNT_MAX.toLocaleString("en-IN")}`
    )
    .optional()
    .default(0),

  // ─────────────────────────────────────────────
  // ACTIVE STATUS
  // ─────────────────────────────────────────────
  isActive: z.boolean().optional().default(true),
});

// ═══════════════════════════════════════════════════════════
// UPDATE SCHEMA
// ═══════════════════════════════════════════════════════════

export const karigarUpdateSchema = karigarSchema.extend({
  id: z.string().min(1, "Karigar ID is required"),
});

// ═══════════════════════════════════════════════════════════
// FILTERS SCHEMA
// ═══════════════════════════════════════════════════════════

export const karigarFiltersSchema = z.object({
  search: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
  sortBy: z.enum(["name", "balance", "createdAt"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
});

// ═══════════════════════════════════════════════════════════
// DELETE SCHEMA
// ═══════════════════════════════════════════════════════════

export const karigarDeleteSchema = z.object({
  id: z.string().min(1, "Karigar ID is required"),
});

// ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════

export type KarigarSchemaInput = z.input<typeof karigarSchema>;
export type KarigarSchemaOutput = z.output<typeof karigarSchema>;

export type KarigarUpdateSchemaInput = z.input<typeof karigarUpdateSchema>;
export type KarigarUpdateSchemaOutput = z.output<typeof karigarUpdateSchema>;

export type KarigarFiltersSchemaInput = z.input<typeof karigarFiltersSchema>;
export type KarigarFiltersSchemaOutput = z.output<typeof karigarFiltersSchema>;

export type KarigarDeleteSchemaInput = z.input<typeof karigarDeleteSchema>;
export type KarigarDeleteSchemaOutput = z.output<typeof karigarDeleteSchema>;
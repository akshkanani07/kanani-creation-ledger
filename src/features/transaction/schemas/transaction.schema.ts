/**
 * Transaction Validation Schemas
 * 
 * Zod v4 — Fixed innerType issue by separating base + refined schemas.
 */

import { z } from "zod";
import { VALIDATION } from "@/config/constants";

// ═══════════════════════════════════════════════════════════
// ENUMS
// ═══════════════════════════════════════════════════════════

const transactionTypeEnum = z.enum([
  "OPENING_BALANCE",
  "WORK",
  "PAYMENT",
  "ADVANCE",
  "DEDUCTION",
]);

const transactionDirectionEnum = z.enum(["CREDIT", "DEBIT"]);

const paymentModeEnum = z.enum([
  "CASH",
  "UPI",
  "BANK_TRANSFER",
  "CHEQUE",
  "OTHER",
]);

// ═══════════════════════════════════════════════════════════
// DEFAULT DIRECTION MAP
// ═══════════════════════════════════════════════════════════

export const TYPE_DEFAULT_DIRECTION: Record<
  z.infer<typeof transactionTypeEnum>,
  z.infer<typeof transactionDirectionEnum>
> = {
  OPENING_BALANCE: "CREDIT",
  WORK: "CREDIT",
  PAYMENT: "DEBIT",
  ADVANCE: "DEBIT",
  DEDUCTION: "DEBIT",
};

// ═══════════════════════════════════════════════════════════
// BASE SCHEMA (No Refinements) — Reusable for Update
// ═══════════════════════════════════════════════════════════

const transactionBaseSchema = z.object({
  // KARIGAR
  karigarId: z.string().min(1, "Please select a karigar"),

  // TYPE
  type: transactionTypeEnum,

  // DIRECTION
  direction: transactionDirectionEnum.optional(),

  // AMOUNT
  amount: z.coerce
    .number()
    .positive("Amount must be greater than 0")
    .max(
      VALIDATION.AMOUNT_MAX,
      `Amount cannot exceed ₹${VALIDATION.AMOUNT_MAX.toLocaleString("en-IN")}`
    ),

  // QUANTITY
  quantity: z.coerce
    .number()
    .positive("Quantity must be greater than 0")
    .optional()
    .or(z.literal(""))
    .transform((val) => (val === "" || val === undefined ? undefined : val)),

  // RATE
  rate: z.coerce
    .number()
    .positive("Rate must be greater than 0")
    .optional()
    .or(z.literal(""))
    .transform((val) => (val === "" || val === undefined ? undefined : val)),

  // PAYMENT MODE
  paymentMode: paymentModeEnum.optional().nullable(),

  // REFERENCE
  reference: z
    .string()
    .trim()
    .max(50, "Reference must be less than 50 characters")
    .optional()
    .or(z.literal(""))
    .transform((val) => (val === "" ? undefined : val)),

  // DESCRIPTION
  description: z
    .string()
    .trim()
    .min(2, "Description is required")
    .max(
      VALIDATION.DESCRIPTION_MAX,
      `Description must be less than ${VALIDATION.DESCRIPTION_MAX} characters`
    ),

  // DATE
  transactionDate: z.coerce
    .date()
    .max(new Date(), "Transaction date cannot be in the future")
    .optional(),
});

// ═══════════════════════════════════════════════════════════
// REFINED SCHEMA — With Cross-Field Validation
// ═══════════════════════════════════════════════════════════

export const transactionSchema = transactionBaseSchema
  .refine(
    (data) => {
      // Work MUST have quantity + rate
      if (data.type === "WORK" && (!data.quantity || !data.rate)) {
        return false;
      }
      return true;
    },
    {
      message: "Quantity and rate are required for Work transactions",
      path: ["quantity"],
    }
  )
  .refine(
    (data) => {
      // Payment/Advance SHOULD have payment mode
      if (
        (data.type === "PAYMENT" || data.type === "ADVANCE") &&
        !data.paymentMode
      ) {
        return false;
      }
      return true;
    },
    {
      message: "Payment mode is required for payments and advances",
      path: ["paymentMode"],
    }
  )
  .transform((data) => ({
    ...data,
    direction: data.direction ?? TYPE_DEFAULT_DIRECTION[data.type],
    transactionDate: data.transactionDate ?? new Date(),
  }));

// ═══════════════════════════════════════════════════════════
// UPDATE SCHEMA — Base + ID (No Refinements)
// ═══════════════════════════════════════════════════════════

export const transactionUpdateSchema = transactionBaseSchema
  .extend({
    id: z.string().min(1, "Transaction ID is required"),
  })
  .transform((data) => ({
    ...data,
    // Auto-derive direction if type provided
    direction:
      data.direction ??
      (data.type ? TYPE_DEFAULT_DIRECTION[data.type] : undefined),
  }));

// ═══════════════════════════════════════════════════════════
// FILTERS SCHEMA
// ═══════════════════════════════════════════════════════════

export const transactionFiltersSchema = z.object({
  karigarId: z.string().optional(),
  type: transactionTypeEnum.optional(),
  direction: transactionDirectionEnum.optional(),
  search: z.string().optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  sortBy: z.enum(["date", "amount", "createdAt"]).optional().default("date"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});

// ═══════════════════════════════════════════════════════════
// DELETE SCHEMA
// ═══════════════════════════════════════════════════════════

export const transactionDeleteSchema = z.object({
  id: z.string().min(1, "Transaction ID is required"),
});

// ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════

export type TransactionSchemaInput = z.input<typeof transactionSchema>;
export type TransactionSchemaOutput = z.output<typeof transactionSchema>;

export type TransactionUpdateSchemaInput = z.input<
  typeof transactionUpdateSchema
>;
export type TransactionUpdateSchemaOutput = z.output<
  typeof transactionUpdateSchema
>;

export type TransactionFiltersSchemaInput = z.input<
  typeof transactionFiltersSchema
>;
export type TransactionFiltersSchemaOutput = z.output<
  typeof transactionFiltersSchema
>;

export type TransactionDeleteSchemaInput = z.input<
  typeof transactionDeleteSchema
>;
export type TransactionDeleteSchemaOutput = z.output<
  typeof transactionDeleteSchema
>;
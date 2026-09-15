/**
 * Common Validation Utilities
 * 
 * Reusable validators used across the application.
 * These are PURE functions — used for client-side checks.
 * Zod schemas live in feature-specific folders.
 * 
 * USAGE:
 *   import { isValidEmail, isValidAmount } from "@/utils/validation";
 */

import { VALIDATION } from "@/config/constants";
import { normalizePhone } from "./format-phone";

// ============================================================
// EMAIL
// ============================================================

/**
 * Validates an email address.
 * 
 * @example
 *   isValidEmail("user@example.com")  // → true
 *   isValidEmail("invalid")           // → false
 */
export function isValidEmail(email: string): boolean {
  if (!email) return false;
  // Simple RFC 5322-based regex
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email.trim());
}

// ============================================================
// PHONE
// ============================================================

/**
 * Validates an Indian mobile number.
 */
export function isValidPhone(phone: string): boolean {
  const cleaned = normalizePhone(phone);
  return /^[6-9]\d{9}$/.test(cleaned);
}

// ============================================================
// NAME
// ============================================================

/**
 * Validates a name (2-100 characters, no special symbols except spaces/dots/hyphens).
 * Supports Gujarati/Hindi Unicode characters.
 * 
 * @example
 *   isValidName("Rajesh Kumar")     // → true
 *   isValidName("રમેશ")              // → true (Gujarati)
 *   isValidName("A")                // → false (too short)
 */
export function isValidName(name: string): boolean {
  if (!name) return false;
  const trimmed = name.trim();

  if (trimmed.length < VALIDATION.NAME_MIN) return false;
  if (trimmed.length > VALIDATION.NAME_MAX) return false;

  // Allow letters (including Unicode), spaces, dots, hyphens
  const regex = /^[\p{L}\s.\-']+$/u;
  return regex.test(trimmed);
}

// ============================================================
// AMOUNT
// ============================================================

/**
 * Validates a monetary amount.
 * Must be a positive number, within max limit, max 2 decimals.
 * 
 * @example
 *   isValidAmount(500)       // → true
 *   isValidAmount(500.50)    // → true
 *   isValidAmount(-100)      // → false
 *   isValidAmount(0)         // → false
 */
export function isValidAmount(amount: number | string): boolean {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;

  if (!isFinite(num)) return false;
  if (num <= 0) return false;
  if (num > VALIDATION.AMOUNT_MAX) return false;

  // Check max 2 decimals
  const decimals = (num.toString().split(".")[1] ?? "").length;
  if (decimals > 2) return false;

  return true;
}

/**
 * Validates a quantity (positive integer or decimal).
 */
export function isValidQuantity(qty: number | string): boolean {
  const num = typeof qty === "string" ? parseFloat(qty) : qty;
  return isFinite(num) && num > 0;
}

/**
 * Validates a rate (positive number).
 */
export function isValidRate(rate: number | string): boolean {
  const num = typeof rate === "string" ? parseFloat(rate) : rate;
  return isFinite(num) && num > 0;
}

// ============================================================
// TEXT
// ============================================================

/**
 * Validates description text length.
 */
export function isValidDescription(text: string): boolean {
  if (!text) return false;
  const trimmed = text.trim();
  return trimmed.length >= 1 && trimmed.length <= VALIDATION.DESCRIPTION_MAX;
}

/**
 * Validates address length.
 */
export function isValidAddress(text: string): boolean {
  if (!text) return true; // Address optional
  return text.trim().length <= VALIDATION.ADDRESS_MAX;
}

// ============================================================
// PASSWORD / SECRET (Future-proof)
// ============================================================

/**
 * Validates a secret/token length.
 */
export function isValidSecret(secret: string): boolean {
  return typeof secret === "string" && secret.length >= 32;
}

// ============================================================
// COMPOSITE VALIDATORS
// ============================================================

/**
 * Validates all fields of a karigar object.
 * Returns object with field-level errors (empty object if valid).
 * 
 * @example
 *   validateKarigar({ name: "R", phone: "123" })
 *   // → { name: "Name too short", phone: "Invalid phone number" }
 */
export function validateKarigar(data: {
  name: string;
  phone: string;
  address?: string;
}): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!isValidName(data.name)) {
    errors.name = "Name must be 2-100 characters";
  }

  if (!isValidPhone(data.phone)) {
    errors.phone = "Enter a valid 10-digit mobile number";
  }

  if (data.address && !isValidAddress(data.address)) {
    errors.address = `Address must be under ${VALIDATION.ADDRESS_MAX} characters`;
  }

  return errors;
}
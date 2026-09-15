/**
 * Indian Phone Number Utilities
 * 
 * Handles 10-digit Indian mobile numbers consistently across the app.
 * Always stores as plain 10 digits, formats for display.
 * 
 * WHY THIS FILE EXISTS:
 * - Indian phone formats vary (+91, 0 prefix, spaces, dashes)
 * - Karigar phone numbers need consistent storage
 * - WhatsApp links need specific format (91XXXXXXXXXX)
 * 
 * USAGE:
 *   import { formatPhone, normalizePhone, isValidPhone } from "@/utils/format-phone";
 */

// ============================================================
// CONSTANTS
// ============================================================

const INDIA_COUNTRY_CODE = "91";
const PHONE_LENGTH = 10;

// ============================================================
// VALIDATION
// ============================================================

/**
 * Checks if a string is a valid Indian mobile number (10 digits starting with 6-9).
 * 
 * @example
 *   isValidPhone("9876543210")      // → true
 *   isValidPhone("+91 9876543210")  // → true (after cleaning)
 *   isValidPhone("12345")           // → false
 *   isValidPhone("1234567890")      // → false (starts with 1)
 */
export function isValidPhone(phone: string): boolean {
  const cleaned = normalizePhone(phone);
  return /^[6-9]\d{9}$/.test(cleaned);
}

/**
 * Checks if a phone number is empty.
 */
export function isEmptyPhone(phone: string | null | undefined): boolean {
  return !phone || phone.trim().length === 0;
}

// ============================================================
// NORMALIZATION
// ============================================================

/**
 * Normalizes a phone number to 10 digits.
 * Removes spaces, dashes, +91, 0 prefix, parentheses.
 * 
 * @example
 *   normalizePhone("+91 98765 43210")   // → "9876543210"
 *   normalizePhone("098765-43210")      // → "9876543210"
 *   normalizePhone("(987) 654-3210")    // → "9876543210"
 *   normalizePhone("9876543210")        // → "9876543210"
 */
export function normalizePhone(phone: string): string {
  if (!phone) return "";

  // Remove all non-digits
  let cleaned = phone.replace(/\D/g, "");

  // Remove country code (91) if present at start
  if (cleaned.startsWith(INDIA_COUNTRY_CODE) && cleaned.length > PHONE_LENGTH) {
    cleaned = cleaned.slice(INDIA_COUNTRY_CODE.length);
  }

  // Remove leading 0 if present
  if (cleaned.startsWith("0") && cleaned.length > PHONE_LENGTH) {
    cleaned = cleaned.slice(1);
  }

  // Keep only last 10 digits (in case of extra digits)
  if (cleaned.length > PHONE_LENGTH) {
    cleaned = cleaned.slice(-PHONE_LENGTH);
  }

  return cleaned;
}

// ============================================================
// FORMATTING
// ============================================================

/**
 * Formats a phone number for display (+91 98765 43210).
 * 
 * @example
 *   formatPhone("9876543210")       // → "+91 98765 43210"
 *   formatPhone("+91 9876543210")   // → "+91 98765 43210"
 *   formatPhone("")                 // → "—"
 */
export function formatPhone(phone: string | null | undefined): string {
  if (!phone) return "—";

  const cleaned = normalizePhone(phone);
  if (cleaned.length !== PHONE_LENGTH) return phone; // Return as-is if invalid

  return `+${INDIA_COUNTRY_CODE} ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
}

/**
 * Formats a phone number for WhatsApp link (919876543210).
 * No spaces, no plus, no dashes.
 * 
 * @example
 *   formatPhoneForWhatsApp("9876543210")  // → "919876543210"
 */
export function formatPhoneForWhatsApp(phone: string): string {
  const cleaned = normalizePhone(phone);
  if (cleaned.length !== PHONE_LENGTH) return "";
  return `${INDIA_COUNTRY_CODE}${cleaned}`;
}

/**
 * Formats a phone number for tel: links.
 * 
 * @example
 *   formatPhoneForTel("9876543210")  // → "+919876543210"
 */
export function formatPhoneForTel(phone: string): string {
  const cleaned = normalizePhone(phone);
  if (cleaned.length !== PHONE_LENGTH) return "";
  return `+${INDIA_COUNTRY_CODE}${cleaned}`;
}

// ============================================================
// MASKING
// ============================================================

/**
 * Masks middle digits of a phone number for privacy.
 * 
 * @example
 *   maskPhone("9876543210")  // → "98******10"
 */
export function maskPhone(phone: string): string {
  const cleaned = normalizePhone(phone);
  if (cleaned.length !== PHONE_LENGTH) return phone;
  return `${cleaned.slice(0, 2)}******${cleaned.slice(-2)}`;
}
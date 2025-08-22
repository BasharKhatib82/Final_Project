// utils/validateAndSanitizeEmail.js

/**
 * Validate and sanitize email address
 * - Removes hidden unicode characters
 * - Normalizes text
 * - Validates email format
 *
 * @param {string} email - input email address
 * @returns {string} sanitized email
 * @throws {Error} if email is invalid
 */
export function validateAndSanitizeEmail(email) {
  if (!email || typeof email !== "string") {
    throw new Error("Email must be a string");
  }

  // 1. Normalize & remove hidden Unicode chars
  let sanitized = email.normalize("NFKC").replace(/[^\x20-\x7E]/g, "");

  // 2. Trim spaces
  sanitized = sanitized.trim();

  // 3. Validate format with regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(sanitized)) {
    throw new Error("Invalid email address");
  }

  return sanitized;
}

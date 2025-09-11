// frontend/src/utils/validateAndSanitizeEmail.js

/**
 * קובץ: validateAndSanitizeEmail.js
 * ----------------------------------
 * מטרת הקובץ: לבדוק ולנקות כתובת אימייל שהוזנה על ידי המשתמש,
 * כדי לוודא שהיא תקינה לשימוש ואינה מכילה תווים לא חוקיים.
 *
 * למה צריך את זה?
 * - משתמשים יכולים להזין אימיילים לא תקינים (חסרים @ או נקודה).
 * - שמזיקים למסד הנתונים = חבויים Unicode עלולים להופיע תווי  .
 *
 * שימוש עיקרי:
 * - טפסי הרשמה / התחברות / איפוס סיסמה
 * - כל מקום שבו נדרשת קלט אימייל מהמשתמש
 */

/**
 * validateAndSanitizeEmail
 * ------------------------------------------------------
 * מנקה ומאמת כתובת אימייל.
 *
 * שלבים:
 * 1. בדיקה ראשונית שהקלט הוא מחרוזת לא ריקה.
 * 2. Normalization (NFKC) + הסרת תווים חבויים/חריגים (חוקי ASCII רק ).
 * 3. הסרת רווחים מיותרים בתחילת ובסוף המחרוזת.
 * 4. של אימייל תקני regex בדיקת התאמה ל  .
 *
 * @param {string} email - כתובת אימייל שהוזנה על ידי המשתמש
 * @returns {string} כתובת אימייל נקייה ותקינה
 * @throws {Error} אם האימייל לא תקין
 *
 */
export default function validateAndSanitizeEmail(email) {
  if (!email || typeof email !== "string") {
    throw new Error("כתובת דואר אלקטרוני לא חוקית");
  }

  // 1. Normalize & remove hidden Unicode chars
  let sanitized = email.normalize("NFKC").replace(/[^\x20-\x7E]/g, "");

  // 2. Trim spaces
  sanitized = sanitized.trim();

  // 3. Validate format with regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(sanitized)) {
    throw new Error("כתובת דואר אלקטרוני לא חוקית");
  }

  return sanitized;
}

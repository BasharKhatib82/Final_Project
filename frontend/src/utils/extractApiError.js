// frontend\src\utils\extractApiError.js

/**
 * קובץ: extractApiError.js
 * -------------------------
 * (Error) מטרת הקובץ: לחלץ הודעת שגיאה קריאה למשתמש מתוך אובייקט השגיאה
 *  Axios עם APIשמוחזר מקריאות   .
 *
 * שימוש :
 * - (או אובייקט מורכב message, error ) שרתים מחזירים שגיאות בפורמטים שונים .
 * - (err.message) צמו יש הודעת שגיאה Axios לפעמים ל
 * - (fallback) אם אין שום דבר שימושי, מחזירים הודעת ברירת מחדל .
 *
 * שימוש :
 * err.userMessage : כדי להוסיף לכל שגיאה שדה חדש
 * כך בכל הקוד בצד לקוח אפשר להציג הודעות שגיאה פשוטות וברורות.
 *
 * extractApiError
 * ------------------------------------------------------
 * @param {object} err - Axios אובייקט השגיאה שמוחזר על ידי
 * @param {string} fallback - הודעת ברירת מחדל (אם לא נמצאה הודעה אחרת)
 * @returns {string} הודעת השגיאה הכי קריאה למשתמש
 */

const extractApiError = (err, fallback = "שגיאה כללית") =>
  err?.response?.data?.message ||
  err?.response?.data?.error ||
  err?.message ||
  fallback;

export default extractApiError;

// backend\utils\sanitizeHtml.js
/**
 * כדי למנוע הזרקות HTML entities ממיר תווים מסוכנים ל ־
 * מקבל: string
 * מחזיר: string בטוח לתצוגה ב-HTML
 */
export const escapeHtml = (s = "") =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

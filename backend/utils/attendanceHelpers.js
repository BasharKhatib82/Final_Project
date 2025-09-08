// utils/attendanceHelpers.js

// סטטוסים שלא דורשים שעות כניסה/יציאה
export const SPECIAL_STATUSES = ["חופשה", "מחלה", "היעדרות"];

/**
 * בדיקה האם סטטוס מיוחד (ללא שעות)
 * מקבל: status (string)
 * מחזיר: boolean
 */
export const isSpecialStatus = (status) => SPECIAL_STATUSES.includes(status);

/**
 * YYYY-MM-DD : בדיקת תאריך בפורמט
 * מקבל: date (string)
 * מחזיר: boolean
 */
export const isValidDate = (date) => /^\d{4}-\d{2}-\d{2}$/.test(String(date));

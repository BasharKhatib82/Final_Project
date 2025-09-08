// utils/leadsHelpers.js

// סטטוסים חוקיים לפנייה
export const VALID_LEAD_STATUSES = ["חדש", "בטיפול", "טופל", "בוטלה"];

/**
 * בדיקת סטטוס חוקי לפנייה
 * מקבל: status (string)
 * מחזיר: boolean
 */
export const isValidLeadStatus = (status) =>
  VALID_LEAD_STATUSES.includes(status);

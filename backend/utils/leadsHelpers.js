// backend\utils\leadsHelpers.js

// סטטוסים חוקיים לפנייה
export const VALID_LEAD_STATUSES = ["חדשה", "בטיפול", "טופלה", "בוטלה"];

/**
 * בדיקת סטטוס חוקי לפנייה
 * מקבל: status (string)
 * מחזיר: boolean
 */
export const isValidLeadStatus = (status) =>
  VALID_LEAD_STATUSES.includes(status);

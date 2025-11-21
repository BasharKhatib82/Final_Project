// backend\utils\tasksHelpers.js

// סטטוסים חוקיים למשימות
export const VALID_TASK_STATUSES = ["חדשה", "בטיפול", "טופלה", "בוטלה"];

/**
 * בדיקת סטטוס חוקי למשימה
 * מקבל: status (string)
 * מחזיר: boolean
 */
export const isValidTaskStatus = (status) =>
  VALID_TASK_STATUSES.includes(status);

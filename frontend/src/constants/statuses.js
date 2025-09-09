// frontend\src\constants\statuses.js

// סטטוסי פניות
export const LEAD_STATUSES = ["חדש", "בטיפול", "טופל", "בוטלה"];

// סטטוסי משימות
export const TASK_STATUSES = ["חדש", "בתהליך", "הושלם", "בוטלה"];

// סטטוסי תפקיד
export const ROLE_STATUSES = {
  ACTIVE: { value: 1, label: "תפקיד פעיל" },
  INACTIVE: { value: 0, label: "תפקיד לא פעיל" },
};

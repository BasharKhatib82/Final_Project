// backend/utils/permissions.js

// DB רשימת כל השדות של הרשאות כפי שהם מוגדרים ב
export const roleFields = [
  // הרשאות
  // לוח בקרה
  "dashboard_access",
  "admin_alert_dash",
  "user_alert_dash",
  "admin_status_dash",
  "user_status_dash",
  // ניהול תפקידים
  "roles_page_access",
  "permission_add_role",
  "permission_edit_role",
  "permission_delete_role",
  // ניהול משתמשים
  "users_page_access",
  "permission_add_user",
  "permission_edit_user",
  "permission_delete_user",
  // נוכחות ושעות עבודה
  "attendance_page_access",
  "permission_check_in_out",
  "permission_add_attendance",
  "permission_edit_attendance",
  // ניהול פניות
  "leads_page_access",
  "permission_add_lead",
  "permission_assign_lead",
  "permission_view_lead",
  "permission_edit_lead",
  "permission_delete_lead",
  // ניהול פרויקטים
  "projects_page_access",
  "permission_add_project",
  "permission_edit_project",
  "permission_delete_project",
  // ניהול משימות
  "tasks_page_access",
  "permission_add_task",
  "permission_assign_task",
  "permission_view_task",
  "permission_edit_task",
  "permission_delete_task",
  // דוח לוג פעילות
  "logs_page_access",
];

// SELECT SQL פונקציה : מייצרת
// SQL לשימוש ב SELECT יוצר מחרוזת
export const roleFieldsSQL = roleFields.join(", ");

// פונקציה : אובייקט עם כל ההרשאות מאותחל ל-0
export const emptyPermissions = () =>
  roleFields.reduce((acc, field) => ({ ...acc, [field]: 0 }), {});

// utils/permissions.js

// רשימת כל השדות של הרשאות כפי שהם מוגדרים ב-DB
export const roleFields = [
  // הרשאות
  "admin_alert_dash",
  "user_alert_dash",
  "admin_status_dash",
  "user_status_dash",
  "role_management",
  "can_manage_users",
  "can_view_reports",
  "can_assign_leads",
  "lead_add_btn",
  "can_edit_courses",
  "can_manage_tasks",
  "can_access_all_data",
  "attendance_clock_self",
  "attendance_add_btn",
  "attendance_edit_btn",
  "attendance_view_team",
];

// SELECT SQL פונקציה : מייצרת
export const roleFieldsSQL = roleFields.join(", ");

// פונקציה : אובייקט עם כל ההרשאות מאותחל ל-0
export const emptyPermissions = () =>
  roleFields.reduce((acc, field) => ({ ...acc, [field]: 0 }), {});

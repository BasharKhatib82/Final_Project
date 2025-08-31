// src/constants/permissions.js

export const permissionsSchema = {
  דשבורד: [
    { key: "dashboard_access", label: "גישה ל-דשבורד" },
    { key: "admin_alert_dash", label: "התראות מנהל" },
    { key: "user_alert_dash", label: "התראות משתמש" },
    { key: "admin_status_dash", label: "סטטוסים מנהל" },
    { key: "user_status_dash", label: "סטטוסים משתמש" },
  ],
  "ניהול תפקידים": [
    { key: "roles_page_access", label: "גישה לדף תפקידים" },
    { key: "permission_add_role", label: "הוספת תפקיד חדש" },
    { key: "permission_edit_role", label: "עדכון פרטי תפקיד" },
    { key: "permission_delete_role", label: "מחיקת תפקיד" },
  ],
  "ניהול משתמשים": [
    { key: "users_page_access", label: "גישה לדף משתמשים" },
    { key: "permission_add_user", label: "הוספת משתמש חדש" },
    { key: "permission_edit_user", label: "עדכון פרטי משתמש" },
    { key: "permission_delete_user", label: "מחיקת משתמש" },
  ],
  "ניהול דוחות": [{ key: "reports_page_access", label: "גישה לדף דוחות" }],
  "נוכחות ושעות עבודה": [
    { key: "permission_check_in_out", label: "כניסה / יציאה" },
    { key: "attendance_page_access", label: "גישה לדף נוכחות" },
    { key: "permission_add_attendance", label: "הוספת רישום ידני" },
    { key: "permission_edit_attendance", label: "עדכון פרטי נוכחות" },
  ],
  "ניהול פניות": [
    { key: "leads_page_access", label: "גישה לדף פניות" },
    { key: "permission_add_lead", label: "הוספת פנייה חדשה" },
    { key: "permission_assign_lead", label: "הקצאת פנייה / פניות" },
    { key: "permission_view_lead", label: "צפייה בפרטי פנייה" },
    { key: "permission_edit_lead", label: "עדכון פרטי פנייה" },
    { key: "permission_delete_lead", label: "מחיקת פנייה" },
  ],

  "ניהול פרויקטים": [
    { key: "projects_page_access", label: "גישה לדף פרויקטים" },
    { key: "permission_add_project", label: "הוספת פרויקט חדש" },
    { key: "permission_edit_project", label: "עדכון פרטי פרויקט" },
    { key: "permission_delete_project", label: "מחיקת פרויקט" },
  ],

  "ניהול משימות": [
    { key: "tasks_page_access", label: "גישה לדף משימות" },
    { key: "permission_add_task", label: "הוספת משימה חדשה" },
    { key: "permission_assign_task", label: "הקצאת משימה / משימות" },
    { key: "permission_view_task", label: "צפייה בפרטי משימה" },
    { key: "permission_edit_task", label: "עדכון פרטי משימה" },
    { key: "permission_delete_task", label: "מחיקת משימה" },
  ],

  "דוח לוג פעילות": [{ key: "logs_page_access", label: "גישה ללוג פעילות" }],
};

export const roleDataTemplate = {
  // שם התפקיד
  role_name: "",
  // דשבורד
  dashboard_access: 0,
  admin_alert_dash: 0,
  user_alert_dash: 0,
  admin_status_dash: 0,
  user_status_dash: 0,
  // ניהול תפקידים
  roles_page_access: 0,
  permission_add_role: 0,
  permission_edit_role: 0,
  permission_delete_role: 0,
  // ניהול משתמשים
  users_page_access: 0,
  permission_add_user: 0,
  permission_edit_user: 0,
  permission_delete_user: 0,
  // דוחות
  reports_page_access: 0,
  // נוכחות ושעות עבודה
  attendance_page_access: 0,
  permission_check_in_out: 0,
  permission_add_attendance: 0,
  permission_edit_attendance: 0,
  // ניהול פניות
  leads_page_access: 0,
  permission_add_lead: 0,
  permission_assign_lead: 0,
  permission_view_lead: 0,
  permission_edit_lead: 0,
  permission_delete_lead: 0,
  // ניהול פרויקטים
  projects_page_access: 0,
  permission_add_project: 0,
  permission_edit_project: 0,
  permission_delete_project: 0,
  // ניהול משימות
  tasks_page_access: 0,
  permission_add_task: 0,
  permission_assign_task: 0,
  permission_view_task: 0,
  permission_edit_task: 0,
  permission_delete_task: 0,
  // דוח לוג פעילות
  logs_page_access: 0,
  // סטטוס
  active: 1,
};
export const allPermissionKeys = Object.values(permissionsSchema)
  .flat()
  .map((p) => p.key);

// frontend\src\constants\permissions.js

/**
 *  הקובץ:
 * - להצגה בטופס/מסכים (schema) מגדיר את קבוצות ההרשאות
 * - בצורה דינמית (keys) מפיק רשימת מפתחות הרשאות
 * - לשרת (0/1) payload מספק פונקציות עזר לבניית תבנית תפקיד ריקה ולבניית
 */

export const permissionsSchema = {
  "לוח בקרה": [
    { key: "dashboard_access", label: "גישה ללוח בקרה" },
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

//  ( role_name/active ללא) כל מפתחות ההרשאות
export const allPermissionKeys = Object.values(permissionsSchema)
  .flat()
  .map((p) => p.key);

// בונה אובייקט הרשאות ריק דינמית מכל המפתחות (0)
export const buildEmptyPermissions = () =>
  allPermissionKeys.reduce((acc, k) => ((acc[k] = 0), acc), {});

// ( role_name + active כולל) תבנית ברירת־מחדל לתפקיד חדש
export const makeRoleTemplate = () => ({
  role_name: "",
  active: 1,
  ...buildEmptyPermissions(),
});

// יצוא קבוע roleDataTemplate עבור קוד שמייבא
export const roleDataTemplate = makeRoleTemplate();

/**
 *  לשרת (0/1 בלבד) payload של טופס הרשאות ל state ממיר
 *  קלט : obj
 *  פלט: אובייקט עם כל מפתחות ההרשאות בלבד, בערכים 0/1
 */
export function toPermissionsPayload(obj = {}) {
  const out = {};
  for (const k of allPermissionKeys) {
    out[k] = obj[k] ? 1 : 0;
  }
  return out;
}

/**
 *  UI ממיר רשומת תפקיד מהשרת (שכוללת 0/1) למצב נוח ל
 *  כאן לא משנים 0/1 לבוליאני — נשאיר 0/1 כדי להישאר עקביים עם השרת.
 */
export function fromServerRole(row = {}) {
  const base = makeRoleTemplate();
  const copy = { ...base };
  for (const k of allPermissionKeys) {
    if (k in row) copy[k] = Number(row[k]) === 1 ? 1 : 0;
  }
  if (typeof row.role_name === "string") copy.role_name = row.role_name;
  if ("active" in row) copy.active = Number(row.active) === 1 ? 1 : 0;
  return copy;
}

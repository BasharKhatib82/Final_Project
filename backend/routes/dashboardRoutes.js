import express from "express";
import dbSingleton from "../utils/dbSingleton.js";
import logAction from "../utils/logAction.js";
import verifyToken from "../utils/verifyToken.js";

const connection = dbSingleton.getConnection();
const router = express.Router();

router.get("/", verifyToken, (req, res) => {
  const summary = {
    employees: {},
    roles: {},
    leads: {},
    tasks: {},
    projects: {}, 
    attendance: [],
    logs_by_day: [],
  };

  const queries = {
    employees_active: "SELECT COUNT(*) AS count FROM users WHERE is_active = 1",
    employees_inactive:
      "SELECT COUNT(*) AS count FROM users WHERE is_active = 0",

    roles_total: "SELECT COUNT(*) AS count FROM roles_permissions",
    roles_active:
      "SELECT COUNT(*) AS count FROM roles_permissions WHERE active = 1",
    roles_inactive:
      "SELECT COUNT(*) AS count FROM roles_permissions WHERE active = 0",

    leads_new: "SELECT COUNT(*) AS count FROM leads WHERE status = 'חדש'",
    leads_in_progress:
      "SELECT COUNT(*) AS count FROM leads WHERE status = 'בטיפול'",
    leads_completed:
      "SELECT COUNT(*) AS count FROM leads WHERE status = 'טופל'",

    tasks_new: "SELECT COUNT(*) AS count FROM tasks WHERE status = 'חדש'",
    tasks_in_progress:
      "SELECT COUNT(*) AS count FROM tasks WHERE status = 'בתהליך'",
    tasks_completed:
      "SELECT COUNT(*) AS count FROM tasks WHERE status = 'הושלם'",

    // ✅ שאילתות לפרויקטים
    projects_total: "SELECT COUNT(*) AS count FROM projects",
    projects_active:
      "SELECT COUNT(*) AS count FROM projects WHERE is_active = 1",
    projects_inactive:
      "SELECT COUNT(*) AS count FROM projects WHERE is_active = 0",

    logs_by_day: `
      SELECT DATE(time_date) AS date, COUNT(*) AS total_logs
      FROM user_activity_log
      WHERE time_date >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
      GROUP BY DATE(time_date)
      ORDER BY date ASC
    `,

    attendance_by_user: `
      SELECT u.first_name, u.last_name, COUNT(*) AS total_attendance
      FROM attendance a
      JOIN users u ON u.user_id = a.user_id
      GROUP BY a.user_id
      ORDER BY total_attendance DESC
    `,

    online_users: `
      SELECT u.first_name, u.last_name, r.role_name
      FROM active_tokens t
      JOIN users u ON t.user_id = u.user_id
      JOIN roles_permissions r ON u.role_id = r.role_id
    `,
  };

  const keys = Object.keys(queries);
  let completed = 0;
  let hasError = false;

  keys.forEach((key) => {
    connection.query(queries[key], (err, results) => {
      if (hasError) return;
      if (err) {
        hasError = true;
        console.error("שגיאה בשאילתה:", err);
        return res.status(500).json({ error: "שגיאה בשרת" });
      }

      switch (key) {
        // ✅ ניתוח תוצאות עבור עובדים
        case "employees_active":
          summary.employees.active = results[0].count;
          break;
        case "employees_inactive":
          summary.employees.inactive = results[0].count;
          break;

        // ✅ ניתוח תוצאות עבור תפקידים
        case "roles_total":
          summary.roles.total = results[0].count;
          break;
        case "roles_active":
          summary.roles.active = results[0].count;
          break;
        case "roles_inactive":
          summary.roles.inactive = results[0].count;
          break;

        // ✅ ניתוח תוצאות עבור פניות
        case "leads_new":
          summary.leads.new = results[0].count;
          break;
        case "leads_in_progress":
          summary.leads.in_progress = results[0].count;
          break;
        case "leads_completed":
          summary.leads.completed = results[0].count;
          break;

        // ✅ ניתוח תוצאות עבור משימות
        case "tasks_new":
          summary.tasks.new = results[0].count;
          break;
        case "tasks_in_progress":
          summary.tasks.in_progress = results[0].count;
          break;
        case "tasks_completed":
          summary.tasks.completed = results[0].count;
          break;

        // ✅ ניתוח תוצאות עבור פרויקטים
        case "projects_total":
          summary.projects.total = results[0].count;
          break;
        case "projects_active":
          summary.projects.active = results[0].count;
          break;
        case "projects_inactive":
          summary.projects.inactive = results[0].count;
          break;

        case "logs_by_day":
          summary.logs_by_day = results.map((row) => ({
            date: row.date,
            total_logs: row.total_logs,
          }));
          break;
        case "attendance_by_user":
          summary.attendance = results.map((row) => ({
            name: `${row.first_name} ${row.last_name}`,
            total_hours: row.total_attendance,
          }));
          break;
        case "online_users":
          summary.employees.online_list = results.map((row) => ({
            name: `${row.first_name} ${row.last_name}`,
            role: row.role_name,
          }));
          break;
      }

      completed++;
      if (completed === keys.length) {
        logAction("צפייה בלוח בקרה")(req, res, () => {});
        res.json({ summary });
      }
    });
  });
});

export default router;

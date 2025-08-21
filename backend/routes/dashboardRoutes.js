import express from "express";
import { db } from "../utils/dbSingleton.js";
import logAction from "../utils/logAction.js";
import verifyToken from "../utils/verifyToken.js";

const router = express.Router();

router.get("/", verifyToken, async (req, res) => {
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

  try {
    // ✅ מבצע את כל השאילתות במקביל – יעיל ומהיר יותר
    const results = await Promise.all(
      Object.values(queries).map((q) => db.query(q))
    );

    // 👉 קל לקרוא תוצאות בעזרת destructuring
    const [
      employees_active,
      employees_inactive,
      roles_total,
      roles_active,
      roles_inactive,
      leads_new,
      leads_in_progress,
      leads_completed,
      tasks_new,
      tasks_in_progress,
      tasks_completed,
      projects_total,
      projects_active,
      projects_inactive,
      logs_by_day,
      attendance_by_user,
      online_users,
    ] = results;

    // ✅ השמה מסודרת
    summary.employees = {
      active: employees_active[0][0].count,
      inactive: employees_inactive[0][0].count,
    };

    summary.roles = {
      total: roles_total[0][0].count,
      active: roles_active[0][0].count,
      inactive: roles_inactive[0][0].count,
    };

    summary.leads = {
      new: leads_new[0][0].count,
      in_progress: leads_in_progress[0][0].count,
      completed: leads_completed[0][0].count,
    };

    summary.tasks = {
      new: tasks_new[0][0].count,
      in_progress: tasks_in_progress[0][0].count,
      completed: tasks_completed[0][0].count,
    };

    summary.projects = {
      total: projects_total[0][0].count,
      active: projects_active[0][0].count,
      inactive: projects_inactive[0][0].count,
    };

    summary.logs_by_day = logs_by_day[0].map((row) => ({
      date: row.date,
      total_logs: row.total_logs,
    }));

    summary.attendance = attendance_by_user[0].map((row) => ({
      name: `${row.first_name} ${row.last_name}`,
      total_attendance: row.total_attendance,
    }));

    summary.employees.online_list = online_users[0].map((row) => ({
      name: `${row.first_name} ${row.last_name}`,
      role: row.role_name,
    }));

    res.json({ success: true, summary });
  } catch (err) {
    console.error("❌ שגיאה בשליפת דשבורד:", err);
    res.status(500).json({ success: false, error: "שגיאת שרת" });
  }
});

export default router;

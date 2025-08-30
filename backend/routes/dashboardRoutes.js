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
    leads_by_user_status: [],
    tasks_by_user_status: [],
    tasks_overdue: [],
  };

  const queries = {
    employees_active: "SELECT COUNT(*) AS count FROM users WHERE active = 1",
    employees_inactive: "SELECT COUNT(*) AS count FROM users WHERE active = 0",

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
    leads_canceled:
      "SELECT COUNT(*) AS count FROM leads WHERE status = 'בוטלה'",

    tasks_new: "SELECT COUNT(*) AS count FROM tasks WHERE status = 'חדש'",
    tasks_in_progress:
      "SELECT COUNT(*) AS count FROM tasks WHERE status = 'בתהליך'",
    tasks_completed:
      "SELECT COUNT(*) AS count FROM tasks WHERE status = 'הושלם'",
    tasks_canceled:
      "SELECT COUNT(*) AS count FROM tasks WHERE status = 'בוטלה'",

    projects_total: "SELECT COUNT(*) AS count FROM projects",
    projects_active: "SELECT COUNT(*) AS count FROM projects WHERE active = 1",
    projects_inactive:
      "SELECT COUNT(*) AS count FROM projects WHERE active = 0",

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

    leads_by_day: `
      SELECT DATE(created_at) AS date, COUNT(*) AS count
      FROM leads
      WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `,

    leads_by_source: `
      SELECT source, COUNT(*) AS count
      FROM leads
      WHERE source IS NOT NULL AND source != ''
      GROUP BY source
      ORDER BY count DESC
    `,

    leads_by_user: `
      SELECT CONCAT(u.first_name, ' ', u.last_name) AS name, COUNT(*) AS count
      FROM leads l
      JOIN users u ON l.user_id = u.user_id
      GROUP BY l.user_id
      ORDER BY count DESC
    `,

    // ✅ לידים לפי סטטוס + משתמש
    leads_by_user_status: `
      SELECT l.user_id, u.first_name, u.last_name, l.status, COUNT(*) AS count
      FROM leads l
      JOIN users u ON l.user_id = u.user_id
      GROUP BY l.user_id, l.status
    `,

    // ✅ משימות לפי סטטוס + משתמש
    tasks_by_user_status: `
      SELECT t.user_id, u.first_name, u.last_name, t.status, COUNT(*) AS count
      FROM tasks t
      JOIN users u ON t.user_id = u.user_id
      GROUP BY t.user_id, t.status
    `,

    // ✅ משימות חורגות
    tasks_overdue: `
      SELECT t.user_id, u.first_name, u.last_name, COUNT(*) AS overdue_count
      FROM tasks t
      JOIN users u ON t.user_id = u.user_id
      WHERE t.due_date < CURDATE() AND t.status <> 'הושלם'
      GROUP BY t.user_id
    `,
  };

  try {
    const results = await Promise.all(
      Object.values(queries).map((q) => db.query(q))
    );

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
      leads_by_day,
      leads_by_source,
      leads_by_user,
      leads_by_user_status,
      tasks_by_user_status,
      tasks_overdue,
    ] = results;

    // 🟢 השמות
    summary.leads_by_day = leads_by_day[0].map((row) => ({
      date: row.date,
      count: row.count,
    }));

    summary.leads_by_source = leads_by_source[0].map((row) => ({
      source: row.source,
      count: row.count,
    }));

    summary.leads_by_user = leads_by_user[0].map((row) => ({
      name: row.name,
      count: row.count,
    }));

    summary.leads_by_user_status = leads_by_user_status[0];
    summary.tasks_by_user_status = tasks_by_user_status[0];
    summary.tasks_overdue = tasks_overdue[0];

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

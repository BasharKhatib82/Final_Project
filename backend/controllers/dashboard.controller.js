// backend\controllers\dashboard.controller.js

import { db } from "../utils/dbSingleton.js";

/**
 * מחזיר סיכומי לוח בקרה (סטטיסטיקות + גרפים) במקבץ אחד
 * מה מקבל: —
 * מה מחזיר: { success, data: summary } או שגיאה.
 */
export async function getDashboardSummary(req, res) {
  const user = req.user;

  // פילטרים לפי data_scope
  const leadsFilter =
    user?.data_scope_self === 1
      ? `AND l.user_id = ${db.escape(user.user_id)}`
      : "";
  const tasksFilter =
    user?.data_scope_self === 1
      ? `AND t.user_id = ${db.escape(user.user_id)}`
      : "";
  const attendanceFilter =
    user?.data_scope_self === 1
      ? `WHERE a.user_id = ${db.escape(user.user_id)}`
      : "";

  const summary = {
    users: {},
    roles: {},
    projects: {},
    leads: {},
    tasks: {},
    attendance: [],
    logs_by_day: [],
    leads_by_day: [],
    leads_by_source: [],
    leads_by_user: [],
    leads_by_user_status: [],
    tasks_by_user_status: [],
    tasks_overdue: [],
  };

  const queries = {
    users_active: "SELECT COUNT(*) AS count FROM users WHERE active = 1",
    users_inactive: "SELECT COUNT(*) AS count FROM users WHERE active = 0",

    roles_total: "SELECT COUNT(*) AS count FROM roles_permissions",
    roles_active:
      "SELECT COUNT(*) AS count FROM roles_permissions WHERE active = 1",
    roles_inactive:
      "SELECT COUNT(*) AS count FROM roles_permissions WHERE active = 0",

    leads_new: "SELECT COUNT(*) AS count FROM leads WHERE status = 'חדשה'",
    leads_in_progress:
      "SELECT COUNT(*) AS count FROM leads WHERE status = 'בטיפול'",
    leads_completed:
      "SELECT COUNT(*) AS count FROM leads WHERE status = 'טופלה'",
    leads_canceled:
      "SELECT COUNT(*) AS count FROM leads WHERE status = 'בוטלה'",

    tasks_new: "SELECT COUNT(*) AS count FROM tasks WHERE status = 'חדשה'",
    tasks_in_progress:
      "SELECT COUNT(*) AS count FROM tasks WHERE status = 'בטיפול'",
    tasks_completed:
      "SELECT COUNT(*) AS count FROM tasks WHERE status = 'טופלה'",
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
      ${attendanceFilter}
      GROUP BY a.user_id
      ORDER BY total_attendance DESC
    `,

    online_users: `
      SELECT u.first_name, u.last_name, r.role_name
      FROM active_tokens t
      JOIN users u ON t.user_id = u.user_id
      JOIN roles_permissions r ON u.role_id = r.role_id
      WHERE u.user_id <> 1 AND u.role_id <> 1
    `,

    // --- פניות ---
    leads_by_day: `
      SELECT DATE(l.created_at) AS date, COUNT(*) AS count
      FROM leads l
      WHERE l.created_at >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
      ${leadsFilter}
      GROUP BY DATE(l.created_at)
      ORDER BY date ASC
    `,

    leads_by_source: `
      SELECT l.source, COUNT(*) AS count
      FROM leads l
      WHERE l.source IS NOT NULL AND l.source != ''
      ${leadsFilter}
      GROUP BY l.source
      ORDER BY count DESC
    `,

    leads_by_user: `
      SELECT CONCAT(u.first_name, ' ', u.last_name) AS name, COUNT(*) AS count
      FROM leads l
      JOIN users u ON l.user_id = u.user_id
      GROUP BY l.user_id
      ORDER BY count DESC
    `,

    leads_by_user_status: `
      SELECT l.user_id, u.first_name, u.last_name, l.status, COUNT(*) AS count
      FROM leads l
      JOIN users u ON l.user_id = u.user_id
      ${leadsFilter}
      GROUP BY l.user_id, l.status
    `,

    tasks_by_user_status: `
      SELECT t.user_id, u.first_name, u.last_name, t.status, COUNT(*) AS count
      FROM tasks t
      JOIN users u ON t.user_id = u.user_id
      ${tasksFilter}
      GROUP BY t.user_id, t.status
    `,

    tasks_overdue: `
      SELECT t.user_id, u.first_name, u.last_name, COUNT(*) AS overdue_count
      FROM tasks t
      JOIN users u ON t.user_id = u.user_id
      WHERE t.due_date < CURDATE() AND t.status <> 'הושלמה'
      ${tasksFilter}
      GROUP BY t.user_id
    `,
  };

  try {
    const results = await Promise.all(
      Object.values(queries).map((sql) => db.query(sql))
    );

    const [
      users_active,
      users_inactive,
      roles_total,
      roles_active,
      roles_inactive,
      leads_new,
      leads_in_progress,
      leads_completed,
      leads_canceled,
      tasks_new,
      tasks_in_progress,
      tasks_completed,
      tasks_canceled,
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

    //  משתמשים
    summary.users = {
      active: users_active?.[0]?.[0]?.count ?? 0,
      inactive: users_inactive?.[0]?.[0]?.count ?? 0,
      online_list: (online_users?.[0] || []).map((row) => ({
        name: `${row.first_name} ${row.last_name}`,
        role: row.role_name,
      })),
    };

    //  תפקידים
    summary.roles = {
      total: roles_total?.[0]?.[0]?.count ?? 0,
      active: roles_active?.[0]?.[0]?.count ?? 0,
      inactive: roles_inactive?.[0]?.[0]?.count ?? 0,
    };

    //  פניות
    summary.leads = {
      new: leads_new?.[0]?.[0]?.count ?? 0,
      in_progress: leads_in_progress?.[0]?.[0]?.count ?? 0,
      completed: leads_completed?.[0]?.[0]?.count ?? 0,
      canceled: leads_canceled?.[0]?.[0]?.count ?? 0,
    };

    //  משימות
    summary.tasks = {
      new: tasks_new?.[0]?.[0]?.count ?? 0,
      in_progress: tasks_in_progress?.[0]?.[0]?.count ?? 0,
      completed: tasks_completed?.[0]?.[0]?.count ?? 0,
      canceled: tasks_canceled?.[0]?.[0]?.count ?? 0,
    };

    //  פרויקטים
    summary.projects = {
      total: projects_total?.[0]?.[0]?.count ?? 0,
      active: projects_active?.[0]?.[0]?.count ?? 0,
      inactive: projects_inactive?.[0]?.[0]?.count ?? 0,
    };

    //  לוגים לפי יום
    summary.logs_by_day =
      logs_by_day?.[0]?.map((row) => ({
        date: row.date,
        total_logs: row.total_logs,
      })) || [];

    //  נוכחות לפי משתמש
    summary.attendance =
      attendance_by_user?.[0]?.map((row) => ({
        name: `${row.first_name} ${row.last_name}`,
        total_attendance: row.total_attendance,
      })) || [];

    //  פניות לפי יום
    summary.leads_by_day =
      leads_by_day?.[0]?.map((row) => ({
        date: row.date,
        count: row.count,
      })) || [];

    //  פניות לפי מקור
    summary.leads_by_source =
      leads_by_source?.[0]?.map((row) => ({
        source: row.source,
        count: row.count,
      })) || [];

    //  פניות לפי משתמש
    summary.leads_by_user =
      leads_by_user?.[0]?.map((row) => ({
        name: row.name,
        count: row.count,
      })) || [];

    //  פניות לפי סטטוס-משתמש
    summary.leads_by_user_status = leads_by_user_status?.[0] || [];

    //  משימות לפי סטטוס-משתמש
    summary.tasks_by_user_status = tasks_by_user_status?.[0] || [];

    //  משימות חורגות
    summary.tasks_overdue = tasks_overdue?.[0] || [];

    return res.json({ success: true, data: summary });
  } catch (err) {
    console.error("getDashboardSummary:", err);
    return res.status(500).json({ success: false, message: "שגיאת שרת" });
  }
}

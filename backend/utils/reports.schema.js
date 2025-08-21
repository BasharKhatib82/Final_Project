export const ENTITIES = {
  logs: {
    title: 'דו"ח יומן מערכת',
    baseQuery: `
      SELECT 
        l.log_id,
        COALESCE(NULLIF(CONCAT_WS(' ', u.first_name, u.last_name), ' '), u.name, u.email) AS user_name,
        l.action,
        DATE_FORMAT(l.timestamp, '%d/%m/%Y %H:%i') AS ts_fmt,
        l.subject
      FROM logs l
      LEFT JOIN users u ON u.user_id = l.user_id
      WHERE 1=1
    `,
    filters: {
      from: { sql: "AND DATE(l.timestamp) >= ?", map: (v) => v },
      to: { sql: "AND DATE(l.timestamp) <= ?", map: (v) => v },
      q: {
        sql: "AND (l.action LIKE ? OR COALESCE(u.first_name,'') LIKE ? OR COALESCE(u.last_name,'') LIKE ?)",
        map: (v) => [`%${v}%`, `%${v}%`, `%${v}%`],
      },
      subject: { sql: "AND l.subject = ?", map: (v) => v },
    },
    orderBy: "ORDER BY l.timestamp DESC",
    table: {
      headers: ["מזהה", "שם עובד", "פעולה", "תאריך ושעה"],
      columns: [
        (r) => r.log_id,
        (r) => r.user_name,
        (r) => r.action,
        (r) => r.ts_fmt,
      ],
    },
    rbac: { perm: "can_view_reports" },
  },
};

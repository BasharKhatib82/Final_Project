// backend\utils\logs.helpers.js

/**
 * ולידציה בסיסית לתאריך בפורמט YYYY-MM-DD
 */
export const isValidDate = (d) => /^\d{4}-\d{2}-\d{2}$/.test(String(d || ""));

/**
 * המרת פרמטר -> ( page למספר  <- ( ≥1
 */
export const parsePage = (p) => {
  const n = Number(p);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 1;
};

/**
 * דינמי לפי חיפוש/טווח תאריכים WHERE בניית
 * מחזיר: { where, params }
 */
export function buildWhereClause({ search, from, to }) {
  const params = [];
  let where = "WHERE 1=1";

  if (search) {
    where += ` AND (
      l.log_id LIKE ? OR
      u.first_name LIKE ? OR
      u.last_name LIKE ? OR
      CONCAT(u.first_name, ' ', u.last_name) LIKE ? OR
      l.action_name LIKE ?
    )`;
    const like = `%${search}%`;
    params.push(like, like, like, like, like);
  }
  if (from) {
    where += " AND DATE(l.time_date) >= ?";
    params.push(from);
  }
  if (to) {
    where += " AND DATE(l.time_date) <= ?";
    params.push(to);
  }

  return { where, params };
}

// backend\controllers\logs.controller.js

import { db } from "../utils/dbSingleton.js";

/**
 * שליפת כל הלוגים (כולל פרטי משתמשים)
 * מקבל : כלום
 * מחזיר: מערך רשומות לוגים
 */
export async function listLogs(_req, res) {
  try {
    const [rows] = await db.query(
      `SELECT l.log_id, l.user_id, u.first_name, u.last_name,
              l.time_date, l.action_name
       FROM user_activity_log l
       LEFT JOIN users u ON l.user_id = u.user_id
       ORDER BY l.date DESC`
    );
    return res.json({ success: true, data: rows });
  } catch (err) {
    console.error("listLogs:", err);
    return res.status(500).json({ success: false, message: "שגיאת שרת" });
  }
}

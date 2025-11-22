// backend\utils\logAction.js

import { db } from "./dbSingleton.js";
import { nowIsraelFormatted } from "./date.js";

/**
 *  user_activity_log רושם לוג פעולה לטבלת
 */
export default function logAction(actionName, UserIdLog = null) {
  const name = String(actionName || "")
    .trim()
    .slice(0, 255);

  return async function _log(req, res, next) {
    try {
      const userId = UserIdLog || req?.user?.user_id;
      if (!userId || !name) return next?.();

      const currentTime = nowIsraelFormatted();

      await db.query(
        "INSERT INTO user_activity_log (user_id, action_name, time_date) VALUES (?, ?,?)",
        [userId, name, currentTime]
      );
    } catch (err) {
      // לא מפיל את הבקשה
      console.error("logAction error:", err?.message || err);
    } finally {
      return next?.();
    }
  };
}

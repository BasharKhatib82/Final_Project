// backend\utils\logAction.js

import { db } from "./dbSingleton.js";
import { nowIsraelFormatted } from "./date.js";

/**
 *  user_activity_log רושם לוג פעולה לטבלת
 */
export default function logAction(actionName, forcedUserId = null) {
  const name = String(actionName || "")
    .trim()
    .slice(0, 255);

  return async function _log(req, res, next) {
    try {
      const userId = forcedUserId || req?.user?.user_id;
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

/**
 *  middleware שימוש ישיר בלי :
 *  await logActionNow("שם פעולה", userId)
 */
export async function logActionNow(actionName, userId) {
  try {
    const name = String(actionName || "")
      .trim()
      .slice(0, 255);
    if (!userId || !name) return;
    const currentTime = nowIsraelFormatted();
    await db.query(
      "INSERT INTO user_activity_log (user_id, action_name, time_date) VALUES (?, ?, ?)",
      [userId, name, currentTime]
    );
  } catch (err) {
    console.error("logActionNow error:", err?.message || err);
  }
}

logAction.now = logActionNow;

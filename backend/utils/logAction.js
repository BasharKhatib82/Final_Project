// utils/logAction.js
import { db } from "./dbSingleton.js";

/**
 * רישום פעולה ליומן כ־Middleware או כ־פונקציה עצמאית
 * @param {string} actionName - שם הפעולה לתיעוד
 * @param {number|null} forcedUserId - מזהה משתמש (אם לא סופק, יילקח מ־req.user)
 */
function logAction(actionName, forcedUserId = null) {
  return async (req = {}, res = {}, next) => {
    try {
      const userId = forcedUserId || req.user?.user_id;
      if (!userId || !actionName) {
        console.warn("⚠️ logAction skipped – missing userId or actionName");
        if (typeof next === "function") return next();
        return;
      }

      const now = new Date();
      const query = `
        INSERT INTO user_activity_log (user_id, action_name, time_date)
        VALUES (?, ?, ?)
      `;
      await db.query(query, [userId, actionName, now]);

      console.log(`✅ "${actionName}" נרשמה ללוג עבור משתמש ${userId}`);
    } catch (err) {
      console.error("❌ שגיאה ברישום ללוג:", err.message);
    }

    if (typeof next === "function") return next();
  };
}

/**
 * שימוש חופשי בלי middleware:
 * await logAction.now("התחברות למערכת", userId)
 */
logAction.now = async (actionName, userId) => {
  try {
    if (!userId || !actionName) return;
    const now = new Date();
    await db.query(
      `INSERT INTO user_activity_log (user_id, action_name, time_date) VALUES (?, ?, ?)`,
      [userId, actionName, now]
    );
    console.log(`✅ "${actionName}" נרשמה ללוג עבור משתמש ${userId}`);
  } catch (err) {
    console.error("❌ שגיאה ברישום ללוג:", err.message);
  }
};

export default logAction;

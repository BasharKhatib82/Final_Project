import { db } from "../utils/dbSingleton.js";

/**
 * רישום פעולה ליומן
 * @param {string} actionName - שם הפעולה לתיעוד
 * @param {number|null} UserId - מזהה משתמש (אם לא סופק, יילקח מ-req.user)
 */
function logAction(actionName, UserId = null) {
  return async (req, res, next) => {
    try {
      const userId = UserId || req.user?.user_id;

      if (!userId || !actionName) {
        console.warn("logAction skipped – missing userId or actionName");
        // אם אין next, סיום פה
        if (typeof next === "function") {
          return next();
        }
        return;
      }

      const now = new Date();
      const query = `
        INSERT INTO user_activity_log (user_id, action_name, time_date)
        VALUES (?, ?, ?)
      `;

      await db.query(query, [userId, actionName, now]);
      console.log(
        `✅ פעולה "${actionName}" נרשמה בהצלחה ללוג עבור משתמש ${userId}`
      );
    } catch (err) {
      console.error("❌ שגיאה ברישום ללוג:", err);
    }

    if (typeof next === "function") {
      next();
    }
  };
}

export default logAction;

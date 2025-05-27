import dbSingleton from "./dbSingleton.js";
const connection = dbSingleton.getConnection();

/**
 * רישום פעולה ליומן
 * @param {string} actionName - שם הפעולה לתיעוד
 * @param {number|null} UserId - מזהה משתמש ( אם לא סופק req.user לא חובה - יילקח מ   )
 */
function logAction(actionName, UserId = null) {
  return (req, res, next) => {
    const userId = UserId || req.user?.user_id;

    if (!userId || !actionName) {
      console.warn("logAction skipped – missing userId or actionName");
      return next();
    }

    const now = new Date();
    const query = `
      INSERT INTO user_activity_log (user_id, action_name, time_date)
      VALUES (?, ?, ?)
    `;

    connection.query(query, [userId, actionName, now], (err) => {
      if (err) {
        console.error("שגיאה ברישום ללוג:", err);
      }
      next();
    });
  };
}

export default logAction;

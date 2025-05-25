import dbSingleton from "./dbSingleton.js";

function logAction(actionName) {
  return (req, res, next) => {
    const userId = req.user?.user_id;
    const connection = dbSingleton.getConnection();

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

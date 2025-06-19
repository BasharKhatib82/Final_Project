import dbSingleton from "./dbSingleton.js";
const connection = dbSingleton.getConnection();

/**
 * מבצע בדיקה יומית - אם לעובד אין החתמה בכלל (ליום הנוכחי),
 * תירשם לו נוכחות עם סטטוס "העדרות ללא שעות"
 */
const checkMissingAttendance = () => {
  const today = new Date().toISOString().slice(0, 10); // תאריך בפורמט YYYY-MM-DD

  // שלב 1: שליפת כל העובדים הפעילים
  const getUsersQuery = `SELECT user_id FROM users WHERE is_active = 1`;

  connection.query(getUsersQuery, (err, users) => {
    if (err) {
      console.error("❌ שגיאה בשליפת משתמשים:", err);
      return;
    }

    users.forEach(({ user_id }) => {
      // שלב 2: בדיקה אם יש רשומת נוכחות כלשהי לאותו יום
      const checkAttendanceQuery = `
        SELECT attendance_id FROM attendance
        WHERE user_id = ? AND date = ?
      `;

      connection.query(
        checkAttendanceQuery,
        [user_id, today],
        (err, results) => {
          if (err) {
            console.error("❌ שגיאה בבדיקת נוכחות:", err);
            return;
          }

          if (results.length === 0) {
            // ❗ אין כלל נוכחות לאותו יום – מוסיפים רשומה חדשה עם סטטוס מתאים
            const insertQuery = `
            INSERT INTO attendance (user_id, date, status)
            VALUES (?, ?, 'היעדרות')
          `;
            connection.query(insertQuery, [user_id, today], (err) => {
              if (err) console.error("❌ שגיאה בהכנסת נוכחות חסרה:", err);
              else
                console.log(`⏺️ נרשמה היעדרות ללא שעות עבור משתמש ${user_id}`);
            });
          }
        }
      );
    });
  });
};

export default checkMissingAttendance;

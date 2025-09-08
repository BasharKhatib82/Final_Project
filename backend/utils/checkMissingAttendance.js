// backend\utils\checkMissingAttendance.js
import { db } from "./dbSingleton.js";

/**
 *  "מוסיף לכל משתמש פעיל שאין לו נוכחות היום, רשומה עם סטטוס "היעדרות
 *  מקבל: —
 * מה מחזיר: Promise<void> (מדפיס כמה נוספו)
 */
export default async function checkMissingAttendance() {
  try {
    const [res] = await db.query(`
      INSERT INTO attendance (user_id, date, status)
      SELECT u.user_id, CURDATE(), 'היעדרות'
      FROM users u
      LEFT JOIN attendance a
        ON a.user_id = u.user_id
       AND a.date = CURDATE()
      WHERE u.active = 1
        AND a.attendance_id IS NULL
    `);

    const added = res?.affectedRows || 0;
    if (added > 0) {
      console.log(`Added missing attendance for ${added} users (today)`);
    } else {
      console.log("All active users have attendance for today");
    }
  } catch (err) {
    console.error("Error during attendance check:", err);
  }
}

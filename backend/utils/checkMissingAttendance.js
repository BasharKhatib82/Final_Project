// utils/checkMissingAttendance.js
import { db } from "../utils/dbSingleton.js";

/**
 * ✅ בודק פעם ביום אם יש עובדים פעילים בלי רשומת נוכחות
 * אם אין — מוסיף להם רשומה עם סטטוס "היעדרות".
 */
const checkMissingAttendance = async () => {
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

  try {
    // שליפת כל המשתמשים הפעילים שאין להם נוכחות להיום
    const missingQuery = `
      SELECT u.user_id
      FROM users u
      LEFT JOIN attendance a 
        ON u.user_id = a.user_id AND a.date = ?
      WHERE u.is_active = 1 AND a.attendance_id IS NULL
    `;

    const [missingUsers] = await db.query(missingQuery, [today]);

    if (missingUsers.length === 0) {
      console.log(`✅ All users have attendance for ${today}`);
      return;
    }

    // הוספה במכה אחת (bulk insert)
    const insertQuery = `
      INSERT INTO attendance (user_id, date, status)
      VALUES ?
    `;

    const values = missingUsers.map(({ user_id }) => [
      user_id,
      today,
      "היעדרות",
    ]);

    await db.query(insertQuery, [values]);

    console.log(
      `⏺️ Added missing attendance for ${missingUsers.length} users (${today})`
    );
  } catch (err) {
    console.error("❌ Error during attendance check:", err);
  }
};

export default checkMissingAttendance;

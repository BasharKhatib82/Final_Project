// backend/utils/getUserFullName.js
import { db } from "./dbSingleton.js";

/**
 * מחזירה שם מלא לפי user_id
 * @param {string|number} userId - תעודת זהות / מזהה משתמש
 * @returns {Promise<string|null>} - fullName או null אם לא נמצא
 */
export async function getUserFullNameById(userId) {
  if (!userId) return null;

  try {
    const [rows] = await db.query(
      `SELECT first_name, last_name 
       FROM users 
       WHERE user_id = ?`,
      [userId]
    );

    if (!rows || rows.length === 0) {
      return null; // לא נמצא משתמש
    }

    const { first_name, last_name } = rows[0];
    const fullName = `${first_name || ""} ${last_name || ""}`.trim();

    return fullName || null;
  } catch (err) {
    console.error("getUserFullNameById error:", err);
    return null;
  }
}

// backend/utils/getLastLeadIdByPhone.js
import { db } from "./dbSingleton.js";

/**
 * מחזירה את מספר הפנייה האחרון (הכי חדש) לפי מספר טלפון
 * @param {string} phone - מספר הטלפון (כמו שנשמר בטבלה)
 * @returns {Promise<number|null>} - lead_id האחרון או null אם לא נמצאה פנייה
 */
export default async function getLastLeadIdByPhone(phone) {
  const cleanPhone = String(phone || "").trim();
  if (!cleanPhone) return null;

  try {
    const [rows] = await db.query(
      `
      SELECT lead_id
      FROM leads
      WHERE phone_number = ?
      ORDER BY lead_id DESC
      LIMIT 1
      `,
      [cleanPhone]
    );

    if (!rows || rows.length === 0) {
      return null; // אין פניות למספר הזה
    }

    return rows[0].lead_id;
  } catch (err) {
    console.error("getLastLeadIdByPhone error:", err);
    return null;
  }
}

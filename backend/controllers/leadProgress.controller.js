// controllers/leadProgress.controller.js

import { db } from "../utils/dbSingleton.js";
import verifyToken from "../utils/verifyToken.js"; // רק כדי להזכיר שתלוי middleware (מוקצה בראוטר)
import logAction from "../utils/logAction.js";
import { isValidLeadStatus } from "../utils/leadsHelpers.js";
import { isPositiveInt } from "../utils/fieldValidators.js";

/**
 * שליפת כל תיעודי ההתקדמות לפנייה מסוימת
 * מקבל: :lead_id
 * מחזיר: { success, data: leadProgressList[] }
 */
export async function listLeadProgress(req, res) {
  const { lead_id } = req.params;

  if (!isPositiveInt(lead_id)) {
    return res
      .status(400)
      .json({ success: false, message: "מזהה פנייה לא תקין" });
  }

  const sql = `
    SELECT lp.*, CONCAT(u.first_name, ' ', u.last_name) AS user_name
    FROM lead_progress lp
    JOIN users u ON lp.user_id = u.user_id
    WHERE lp.lead_id = ?
    ORDER BY lp.update_time DESC
  `;

  try {
    const [rows] = await db.query(sql, [Number(lead_id)]);
    return res.json({ success: true, data: rows });
  } catch (err) {
    console.error("listLeadProgress:", err);
    return res.status(500).json({ success: false, message: "שגיאת שרת" });
  }
}

/**
 * הוספת תיעוד חדש + עדכון סטטוס לפנייה
 * מקבל: { lead_id, lead_note, status } בגוף הבקשה (  JWT מזהה משתמש מ )
 * מחזיר: { success, message }
 */
export async function addLeadProgress(req, res) {
  const { lead_id, lead_note, status } = req.body;
  const user_id = req.user?.user_id;

  // ולידציה בסיסית
  if (!isPositiveInt(lead_id) || !user_id) {
    return res
      .status(400)
      .json({ success: false, message: "נתונים חסרים או לא תקינים" });
  }
  const note = String(lead_note ?? "").trim();
  if (!note) {
    return res
      .status(400)
      .json({ success: false, message: "תיאור / תיעוד נדרש" });
  }
  if (!isValidLeadStatus(String(status ?? "").trim())) {
    return res.status(400).json({ success: false, message: "סטטוס לא חוקי" });
  }

  const safeNote = note.slice(0, 1000); // חיתוך בטיחותי לאורך סביר
  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    // ודא שהפנייה קיימת (אופציונלי שנותן הודעה מדויקת)
    const [leadExists] = await conn.query(
      "SELECT 1 FROM leads WHERE lead_id = ?",
      [Number(lead_id)]
    );
    if (leadExists.length === 0) {
      await conn.rollback();
      return res
        .status(404)
        .json({ success: false, message: "פנייה לא נמצאה" });
    }

    // הוספת תיעוד
    const [insProgress] = await conn.query(
      `INSERT INTO lead_progress (lead_id, user_id, lead_note, status, update_time)
       VALUES (?, ?, ?, ?, NOW())`,
      [Number(lead_id), user_id, safeNote, status]
    );
    if (insProgress.affectedRows !== 1) {
      throw new Error("הוספת התיעוד נכשלה");
    }

    // עדכון סטטוס בפנייה
    const [updLead] = await conn.query(
      `UPDATE leads SET status = ? WHERE lead_id = ?`,
      [status, Number(lead_id)]
    );
    if (updLead.affectedRows === 0) {
      throw new Error("הפנייה לא נמצאה לעדכון הסטטוס");
    }

    await conn.commit();

    logAction(`הוספת תיעוד + עדכון סטטוס לפנייה #${lead_id}`, user_id)(
      req,
      res,
      () => {}
    );
    return res.json({ success: true, message: "התיעוד והסטטוס נשמרו בהצלחה" });
  } catch (err) {
    try {
      await conn.rollback();
    } catch (e) {
      console.error("rollback:", e);
    }
    console.error("addLeadProgress:", err);
    const msg = err?.message || "שגיאה בשמירת הנתונים במסד";
    return res.status(500).json({ success: false, message: msg });
  } finally {
    try {
      conn.release();
    } catch (e) {
      console.error("release:", e);
    }
  }
}

import { Router } from "express";
import { db } from "../utils/dbSingleton.js";
import verifyToken from "../utils/verifyToken.js";
import logAction from "../utils/logAction.js";

const router = Router();

// ✅ שליפת כל תיעוד ההתקדמות עבור פנייה מסוימת
router.get("/:lead_id", verifyToken, async (req, res) => {
  const { lead_id } = req.params;

  const sql = `
    SELECT lp.*, CONCAT(u.first_name, ' ', u.last_name) AS user_name
    FROM lead_progress lp
    JOIN users u ON lp.user_id = u.user_id
    WHERE lp.lead_id = ?
    ORDER BY lp.update_time DESC
  `;

  try {
    const [result] = await db.query(sql, [lead_id]);
    res.json({ Status: true, Result: result });
  } catch (err) {
    console.error("שגיאה בשליפת התקדמות:", err);
    res.json({ Status: false, Error: "שגיאה בשרת" });
  }
});

// ✅ הוספת תיעוד חדש + עדכון סטטוס פנייה
router.post("/add", verifyToken, async (req, res) => {
  const { lead_id, lead_note, status } = req.body;
  const user_id = req.user.user_id;

  if (!lead_id || !lead_note || !status) {
    return res.json({ Status: false, Error: "נא למלא את כל השדות" });
  }

  const sql1 = `
    INSERT INTO lead_progress (lead_id, user_id, lead_note, status, update_time)
    VALUES (?, ?, ?, ?, NOW())
  `;

  const sql2 = `
    UPDATE leads
    SET status = ?
    WHERE lead_id = ?
  `;

  try {
    // ✅ שימוש ב-Promise.all לביצוע שתי השאילתות במקביל
    await Promise.all([
      db.query(sql1, [lead_id, user_id, lead_note, status]),
      db.query(sql2, [status, lead_id]),
    ]);

    // רישום פעולה ליומן
    logAction(`הוספת תיעוד + עדכון סטטוס לפנייה #${lead_id}`)(
      req,
      res,
      () => {}
    );
    res.json({ Status: true, Message: "התיעוד והסטטוס נשמרו בהצלחה" });
  } catch (err) {
    console.error("שגיאה בשמירת הנתונים:", err);
    res.json({ Status: false, Error: "שגיאה בשמירת הנתונים במסד" });
  }
});

export default router;

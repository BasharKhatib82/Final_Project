import { Router } from "express";
import { db } from "../utils/dbSingleton.js";
import verifyToken from "../utils/verifyToken.js";
import logAction from "../utils/logAction.js";

const router = Router();

// ✅ שליפת כל תיעוד ההתקדמות עבור פנייה מסוימת
router.get("/:lead_id", verifyToken, async (req, res) => {
  const { lead_id } = req.params;

  if (!lead_id) {
    return res.status(400).json({ Status: false, Error: "חסר מזהה פנייה" });
  }

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
    console.error("❌ שגיאה בשליפת התקדמות:", err);
    res.status(500).json({ Status: false, Error: "שגיאת שרת" });
  }
});

// ✅ הוספת תיעוד חדש + עדכון סטטוס פנייה (בטרנזקציה)
router.post("/add", verifyToken, async (req, res) => {
  const { lead_id, lead_note, status } = req.body;
  const user_id = req.user?.user_id;

  if (!lead_id || !lead_note?.trim() || !status) {
    return res
      .status(400)
      .json({ Status: false, Error: "נא למלא את כל השדות" });
  }

  const conn = await db.getConnection(); // חיבור ייחודי לטרנזקציה
  try {
    await conn.beginTransaction();

    // ✅ הוספת תיעוד חדש
    await conn.query(
      `
      INSERT INTO lead_progress (lead_id, user_id, lead_note, status, update_time)
      VALUES (?, ?, ?, ?, NOW())
    `,
      [lead_id, user_id, lead_note.trim(), status]
    );

    // ✅ עדכון סטטוס בטבלת leads
    await conn.query(
      `
      UPDATE leads
      SET status = ?
      WHERE lead_id = ?
    `,
      [status, lead_id]
    );

    await conn.commit();

    // רישום פעולה ליומן
    logAction(`הוספת תיעוד + עדכון סטטוס לפנייה #${lead_id}`)(
      req,
      res,
      () => {}
    );

    res.json({
      Status: true,
      Message: "התיעוד והסטטוס נשמרו בהצלחה",
    });
  } catch (err) {
    await conn.rollback();
    console.error("❌ שגיאה בשמירת הנתונים:", err);
    res.status(500).json({ Status: false, Error: "שגיאה בשמירת הנתונים במסד" });
  } finally {
    conn.release();
  }
});

export default router;

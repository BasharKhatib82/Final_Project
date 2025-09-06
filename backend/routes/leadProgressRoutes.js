import { Router } from "express";
import { db } from "../utils/dbSingleton.js";
import verifyToken from "../utils/verifyToken.js";
import logAction from "../utils/logAction.js";

const router = Router();

// החלת אימות טוקן על כל הראוטים
router.use(verifyToken);

/****************************************
 *   שליפת כל תיעוד ההתקדמות לפנייה   *
 ****************************************/
/**
 * מה עושה: מחזיר את כל רשומות התקדמות (lead_progress) עבור פנייה מסוימת.
 * מה מקבל (Params): { lead_id }
 * מה מחזיר: { success, data: leadProgressList }
 */
router.get("/:lead_id", async (req, res) => {
  const { lead_id } = req.params;

  if (!lead_id) {
    return res.status(400).json({ success: false, message: "חסר מזהה פנייה" });
  }

  const sql = `
    SELECT lp.*, CONCAT(u.first_name, ' ', u.last_name) AS user_name
    FROM lead_progress lp
    JOIN users u ON lp.user_id = u.user_id
    WHERE lp.lead_id = ?
    ORDER BY lp.update_time DESC
  `;

  try {
    const [leadProgressList] = await db.query(sql, [lead_id]);
    return res.json({ success: true, data: leadProgressList });
  } catch (err) {
    console.error("❌ שגיאה בשליפת התקדמות:", err);
    return res.status(500).json({ success: false, message: "שגיאת שרת" });
  }
});

/***************************************************************
 *   הוספת תיעוד חדש + עדכון סטטוס פנייה (בתוך טרנזקציה)    *
 ***************************************************************/
/**
 * מה עושה: מוסיף רשומת התקדמות לפנייה ומעדכן את סטטוס הפנייה – כפעולה אטומית.
 * מה מקבל (Body): { lead_id, lead_note, status }  | מזהה המשתמש נלקח מה־JWT
 * מה מחזיר: { success, message }
 */
router.post("/add", async (req, res) => {
  const { lead_id, lead_note, status } = req.body;
  const user_id = req.user?.user_id;

  if (!lead_id || !lead_note?.trim() || !status) {
    return res
      .status(400)
      .json({ success: false, message: "נא למלא את כל השדות" });
  }

  const conn = await db.getConnection(); // קבלת חיבור ייעודי לטרנזקציה
  try {
    /**
     * beginTransaction – תחילת טרנזקציה; כל השאילתות עד commit/rollback יהיו באותו הקשר.
     */
    await conn.beginTransaction();

    // ✅ הוספת תיעוד חדש
    const [insertProgress] = await conn.query(
      `
      INSERT INTO lead_progress (lead_id, user_id, lead_note, status, update_time)
      VALUES (?, ?, ?, ?, NOW())
    `,
      [lead_id, user_id, lead_note.trim(), status]
    );

    /**
     * affectedRows – מספר השורות שהושפעו מהפעולה (כאן INSERT).
     * אם הערך 1 – ההכנסה הצליחה; אחרת – יש בעיה.
     */
    if (insertProgress.affectedRows !== 1) {
      throw new Error("הוספת התיעוד נכשלה");
    }

    // ✅ עדכון סטטוס בטבלת leads
    const [updateLead] = await conn.query(
      `
      UPDATE leads
      SET status = ?
      WHERE lead_id = ?
    `,
      [status, lead_id]
    );

    /**
     * affectedRows – עבור UPDATE: אם 0 → כנראה לא קיימת פנייה עם lead_id הזה.
     */
    if (updateLead.affectedRows === 0) {
      throw new Error("הפנייה לא נמצאה לעדכון הסטטוס");
    }

    /**
     * commit – סיום הטרנזקציה בהצלחה; רק עכשיו השינויים נשמרים.
     */
    await conn.commit();

    // רישום פעולה ליומן (כולל מזהה משתמש אם קיים)
    logAction(`הוספת תיעוד + עדכון סטטוס לפנייה #${lead_id}`, user_id)(
      req,
      res,
      () => {}
    );

    return res.json({
      success: true,
      message: "התיעוד והסטטוס נשמרו בהצלחה",
    });
  } catch (err) {
    /**
     * rollback – ביטול כל פעולות הטרנזקציה (אם אחת הפעולות נכשלה).
     */
    try {
      await conn.rollback();
    } catch (e) {
      console.error("❌ שגיאה ב־rollback:", e);
    }

    console.error("❌ שגיאה בשמירת הנתונים:", err);
    const msg = err?.message || "שגיאה בשמירת הנתונים במסד";
    return res.status(500).json({ success: false, message: msg });
  } finally {
    /**
     * release – שחרור החיבור חזרה לבריכה (pool) — חשוב למניעת דליפות חיבורים.
     */
    try {
      conn.release();
    } catch (e) {
      console.error("❌ שגיאה בשחרור חיבור:", e);
    }
  }
});

export default router;

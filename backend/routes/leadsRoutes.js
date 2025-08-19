import express from "express";
import { db } from "../utils/dbSingleton.js";
import verifyToken from "../utils/verifyToken.js";
import logAction from "../utils/logAction.js";

const router = express.Router();

/**
 * @route GET /leads/
 * @desc שליפת כל הפניות (כולל פרויקט, לקוח ונציג מטפל)
 * @access Private (דורש Token)
 */
router.get("/", verifyToken, async (req, res) => {
  const sql = `
    SELECT 
      l.*,
      c.first_name, 
      c.last_name, 
      c.email, 
      c.city, 
      p.project_name,
      u.first_name AS rep_first_name,
      u.last_name AS rep_last_name
    FROM leads l
    LEFT JOIN clients c ON l.phone_number = c.phone_number
    LEFT JOIN projects p ON l.project_id = p.project_id
    LEFT JOIN users u ON l.user_id = u.user_id
    ORDER BY l.lead_id DESC
  `;
  try {
    const [result] = await db.query(sql);
    res.json({ Status: true, Result: result });
  } catch (err) {
    console.error("שגיאה בשליפת הפניות:", err);
    res.status(500).json({ Status: false, Error: "שגיאה בשרת" });
  }
});

/**
 * @route GET /leads/:id
 * @desc שליפת פנייה לפי ID
 * @access Private (דורש Token)
 */
router.get("/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  const sql = `
    SELECT 
      l.*, 
      c.first_name, 
      c.last_name, 
      c.email, 
      c.city, 
      p.project_name,
      u.first_name AS rep_first_name,
      u.last_name AS rep_last_name
    FROM leads l
    LEFT JOIN clients c ON l.phone_number = c.phone_number
    LEFT JOIN projects p ON l.project_id = p.project_id
    LEFT JOIN users u ON l.user_id = u.user_id
    WHERE l.lead_id = ?
  `;
  try {
    const [result] = await db.query(sql, [id]);
    if (result.length > 0) {
      res.json({ Status: true, Result: result[0] });
    } else {
      res.json({ Status: false, Error: "פנייה לא נמצאה" });
    }
  } catch (err) {
    console.error("שגיאה בשליפת פנייה:", err);
    res.status(500).json({ Status: false, Error: "שגיאה בשרת" });
  }
});

/**
 * @route GET /leads/user/:user_id
 * @desc שליפת פניות לפי משתמש
 * @access Private (דורש Token)
 */
router.get("/user/:user_id", verifyToken, async (req, res) => {
  const { user_id } = req.params;
  const sql = `
    SELECT 
      l.*,
      c.first_name,
      c.last_name
    FROM leads l
    JOIN clients c ON l.phone_number = c.phone_number
    WHERE l.user_id = ?
    ORDER BY l.lead_id DESC
  `;
  try {
    const [result] = await db.query(sql, [user_id]);
    res.json({ Status: true, Result: result });
  } catch (err) {
    console.error("שגיאה בשליפת פניות לפי משתמש:", err);
    res.status(500).json({ Status: false, Error: "שגיאה בשרת" });
  }
});

/**
 * @route POST /leads/add
 * @desc הוספת פנייה חדשה
 * @access Private (דורש Token)
 */
router.post("/add", verifyToken, async (req, res) => {
  const { phone_number, project_id, user_id, status } = req.body;

  if (!phone_number || !project_id || !user_id) {
    return res.json({ Status: false, Error: "נא למלא את כל השדות" });
  }

  const sql = `
    INSERT INTO leads (phone_number, project_id, user_id, status, created_at)
    VALUES (?, ?, ?, ?, NOW())
  `;
  const values = [phone_number, project_id, user_id, status];

  try {
    await db.query(sql, values);
    logAction(`יצירת פנייה חדשה עבור טלפון: ${phone_number}`)(
      req,
      res,
      () => {}
    );
    res.json({ Status: true, Message: "הפנייה נוספה בהצלחה" });
  } catch (err) {
    console.error("שגיאה בהוספת פנייה:", err);
    res.status(500).json({ Status: false, Error: "שגיאה בשרת" });
  }
});

/**
 * @route PUT /leads/update-status/:id
 * @desc עדכון סטטוס פנייה בלבד
 * @access Private (דורש Token)
 */
router.put("/update-status/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const sql = `
    UPDATE leads
    SET status = ?
    WHERE lead_id = ?
  `;

  try {
    await db.query(sql, [status, id]);
    logAction(`עדכון סטטוס לפנייה #${id}`)(req, res, () => {});
    res.json({ Status: true, Message: "סטטוס עודכן בהצלחה" });
  } catch (err) {
    console.error("שגיאה בעדכון סטטוס:", err);
    res.status(500).json({ Status: false, Error: "שגיאה בשרת" });
  }
});

/**
 * @route PUT /leads/bulk-assign
 * @desc שיוך מרובה של פניות לנציג
 * @access Private (דורש Token)
 */
router.put("/bulk-assign", verifyToken, async (req, res) => {
  const { leadIds, user_id } = req.body;

  if (!leadIds || leadIds.length === 0) {
    return res.status(400).json({ Status: false, Error: "יש לבחור פניות" });
  }

  const sql = `
    UPDATE leads
    SET user_id = ?
    WHERE lead_id IN (?)
  `;

  try {
    // השתמש ב-db.query עם מערך עבור IN
    await db.query(sql, [user_id || null, leadIds]);
    await logAction(`שיוך מרובה לפניות [${leadIds.join(", ")}]`);
    res.json({ Status: true, Message: "שיוך מרובה עודכן בהצלחה" });
  } catch (err) {
    console.error("שגיאה בשיוך מרובה:", err);
    return res.json({ Status: false, Error: "שגיאה בשיוך מרובה" });
  }
});

/**
 * @route DELETE /leads/delete/:id
 * @desc מחיקה לוגית של פנייה על ידי עדכון הסטטוס ל-'מבוטל'
 * @access Private (דורש Token)
 */
router.delete("/delete/:id", verifyToken, async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db.query(
      `UPDATE leads SET status = 'מבוטל' WHERE lead_id = ?`,
      [id]
    );

    if (result.affectedRows === 0) {
      return res.json({ Status: false, Error: "פנייה לא נמצאה" });
    }

    logAction(`מחיקה לוגית של פנייה #${id}`)(req, res, () => {});
    res.json({ Status: true, Message: "הפנייה סומנה כמבוטלת" });
  } catch (err) {
    console.error("שגיאה במחיקת פנייה:", err);
    res.status(500).json({ Status: false, Error: "שגיאה בשרת" });
  }
});

export default router;

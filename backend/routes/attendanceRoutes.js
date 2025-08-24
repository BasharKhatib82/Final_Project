import express from "express";
import { db } from "../utils/dbSingleton.js";
import verifyToken from "../utils/verifyToken.js";

const router = express.Router();

// 📌 פונקציית עזר – בדיקה אם סטטוס הוא מיוחד
const specialStatuses = ["חופשה", "מחלה", "היעדרות"];
const isSpecial = (status) => specialStatuses.includes(status);

// ✅ הוספת נוכחות
router.post("/add", verifyToken, async (req, res) => {
  const { user_id, date, check_in, check_out, status, notes } = req.body;

  if (!user_id || !date || !status) {
    return res
      .status(400)
      .json({ Status: false, Error: "נא למלא את כל שדות החובה" });
  }

  try {
    const [rows] = await db.query(
      "SELECT * FROM attendance WHERE user_id = ? AND date = ?",
      [user_id, date]
    );

    if (isSpecial(status) && rows.some((r) => r.status === status)) {
      return res.json({
        Status: false,
        Error: `כבר קיימת נוכחות עם סטטוס "${status}" בתאריך זה.`,
      });
    }

    if (!isSpecial(status) && rows.some((r) => r.check_in || r.check_out)) {
      return res.json({
        Status: false,
        Error: "כבר קיימת נוכחות עם שעות לאותו עובד בתאריך זה.",
      });
    }

    if (rows.length > 0) {
      return res.json({
        Status: false,
        Error: "כבר קיימת רשומת נוכחות לעובד זה בתאריך זה.",
      });
    }

    await db.query(
      `INSERT INTO attendance (user_id, date, check_in, check_out, status, notes)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        user_id,
        date,
        isSpecial(status) ? null : check_in,
        isSpecial(status) ? null : check_out,
        status,
        notes || null,
      ]
    );

    res.json({ Status: true, Message: "הנוכחות נוספה בהצלחה" });
  } catch (err) {
    console.error("❌ שגיאה בהוספת נוכחות:", err);
    res.status(500).json({ Status: false, Error: "שגיאת שרת" });
  }
});

// ✅ שליפת כל הנוכחויות
// ✅ שליפת כל הנוכחויות (כולל פרטי עובד)
router.get("/", verifyToken, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT a.attendance_id,
              a.user_id,
              u.first_name,
              u.last_name,
              a.date,
              a.check_in,
              a.check_out,
              a.status,
              a.notes
       FROM attendance a
       LEFT JOIN users u ON a.user_id = u.user_id
       ORDER BY a.date DESC`
    );
    res.json({ Status: true, Result: rows });
  } catch (err) {
    console.error("❌ שגיאה בשליפת נוכחויות:", err);
    res.status(500).json({ Status: false, Error: "שגיאת שרת" });
  }
});

// ✅ שליפה לפי מזהה
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM attendance WHERE attendance_id = ?",
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        Status: false,
        Error: "לא נמצאה רשומת נוכחות עם מזהה זה",
      });
    }

    res.json({ Status: true, Result: rows[0] });
  } catch (err) {
    console.error("❌ שגיאה בשליפת נוכחות לפי ID:", err);
    res.status(500).json({ Status: false, Error: "שגיאת שרת" });
  }
});

// ✅ עדכון לפי מזהה
router.put("/edit/:id", verifyToken, async (req, res) => {
  const { user_id, date, check_in, check_out, status, notes } = req.body;

  if (!user_id || !date || !status) {
    return res
      .status(400)
      .json({ Status: false, Error: "נא למלא את כל שדות החובה" });
  }

  try {
    const [result] = await db.query(
      `UPDATE attendance
       SET user_id = ?, date = ?, check_in = ?, check_out = ?, status = ?, notes = ?
       WHERE attendance_id = ?`,
      [
        user_id,
        date,
        isSpecial(status) ? null : check_in,
        isSpecial(status) ? null : check_out,
        status,
        notes || null,
        req.params.id,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        Status: false,
        Error: "הרשומה לא נמצאה לעדכון",
      });
    }

    res.json({ Status: true, Message: "הנוכחות עודכנה בהצלחה" });
  } catch (err) {
    console.error("❌ שגיאה בעדכון נוכחות:", err);
    res.status(500).json({ Status: false, Error: "שגיאת שרת" });
  }
});

// ✅ דוח היעדרויות אוטומטי
router.get("/generate-absence-report", async (req, res) => {
  const today = new Date().toISOString().split("T")[0];

  try {
    const [rows] = await db.query(
      `SELECT u.user_id, u.first_name, u.last_name
       FROM users u
       LEFT JOIN attendance a
         ON u.user_id = a.user_id AND a.date = ?
       WHERE a.attendance_id IS NULL AND u.active = 1`,
      [today]
    );

    if (rows.length === 0) {
      return res.json({
        Status: true,
        Message: "כל העובדים רשמו נוכחות היום.",
      });
    }

    res.json({
      Status: true,
      Missing: rows,
      Message: `${rows.length} עובדים ללא נוכחות בתאריך ${today}`,
    });
  } catch (err) {
    console.error("❌ שגיאה בדוח חוסרי נוכחות:", err);
    res.status(500).json({ Status: false, Error: "שגיאת שרת" });
  }
});

export default router;

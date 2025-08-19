import express from "express";
// ✅ ייבוא הקוד המקצועי של ה-DB
import { db } from "../utils/dbSingleton.js";
import verifyToken from "../utils/verifyToken.js";

const router = express.Router();

// ✅ הוספת נוכחות - קוד מתוקן ומקצועי
router.post("/add", verifyToken, async (req, res) => {
  const { user_id, date, check_in, check_out, status, notes } = req.body;

  if (!user_id || !date || !status) {
    return res.json({ Status: false, Error: "נא למלא את כל שדות החובה" });
  }

  const specialStatuses = ["חופשה", "מחלה", "היעדרות"];
  const isSpecialStatus = specialStatuses.includes(status);

  if (!isSpecialStatus && (!check_in || !check_out)) {
    return res.json({ Status: false, Error: "יש להזין שעת כניסה ויציאה" });
  }

  const finalCheckIn = isSpecialStatus ? null : check_in;
  const finalCheckOut = isSpecialStatus ? null : check_out;

  try {
    // ✅ בדיקה אם קיימת רשומה לאותו עובד בתאריך הזה באמצעות async/await
    const checkSql = `SELECT * FROM attendance WHERE user_id = ? AND date = ?`;
    const [result] = await db.query(checkSql, [user_id, date]);

    // ✅ כבר קיימת רשומה עם אותו סטטוס מיוחד
    if (isSpecialStatus && result.some((r) => r.status === status)) {
      return res.json({
        Status: false,
        Error: `כבר קיימת רשומת נוכחות עם סטטוס "${status}" לאותו עובד בתאריך זה.`,
      });
    }

    // ✅ כבר קיימת רשומה עם שעת כניסה/יציאה
    if (!isSpecialStatus && result.some((r) => r.check_in || r.check_out)) {
      return res.json({
        Status: false,
        Error: "כבר קיימת נוכחות עם שעות לאותו עובד בתאריך זה.",
      });
    }

    // ✅ קיימת רשומה אחרת (כללית) - מניעת כפילויות מיותרות
    if (result.length > 0) {
      return res.json({
        Status: false,
        Error: "כבר קיימת רשומת נוכחות לעובד זה בתאריך זה.",
      });
    }

    // אם הכל תקין - הוספת נוכחות
    const insertSql = `
      INSERT INTO attendance (user_id, date, check_in, check_out, status, notes)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    // ✅ ביצוע הוספה באמצעות async/await
    await db.query(insertSql, [
      user_id,
      date,
      finalCheckIn,
      finalCheckOut,
      status,
      notes || null,
    ]);

    res.json({ Status: true, Message: "הנוכחות נוספה בהצלחה" });
  } catch (err) {
    console.error("שגיאה בהוספת נוכחות:", err);
    res.json({
      Status: false,
      Error: "שגיאה בשמירה למסד הנתונים",
    });
  }
});

// ✅ הצגת כל הנוכחויות
router.get("/", verifyToken, async (req, res) => {
  const sql = `SELECT * FROM attendance ORDER BY date DESC`;
  try {
    const [result] = await db.query(sql);
    res.json({ Status: true, Result: result });
  } catch (err) {
    console.error("שגיאה בשליפת נוכחויות:", err);
    res.json({ Status: false, Error: "שגיאה בטעינת הנתונים" });
  }
});

// ✅ שליפה לפי מזהה
router.get("/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  const sql = `SELECT * FROM attendance WHERE attendance_id = ?`;

  try {
    const [result] = await db.query(sql, [id]);

    if (result.length === 0) {
      return res.json({
        Status: false,
        Error: "לא נמצאה רשומת נוכחות עם מזהה זה",
      });
    }
    res.json({ Status: true, Result: result[0] });
  } catch (err) {
    console.error("שגיאה בשליפת נוכחות לפי ID:", err);
    res.json({ Status: false, Error: "שגיאה בטעינת הנתונים" });
  }
});

// ✅ עדכון לפי מזהה
router.put("/edit/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  const { user_id, date, check_in, check_out, status, notes } = req.body;

  if (!id || !user_id || !date || !status) {
    return res.json({ Status: false, Error: "נא למלא את כל שדות החובה" });
  }

  const specialStatuses = ["חופשה", "מחלה", "היעדרות"];
  const isSpecialStatus = specialStatuses.includes(status);

  const finalCheckIn = isSpecialStatus ? null : check_in;
  const finalCheckOut = isSpecialStatus ? null : check_out;

  if (!isSpecialStatus && (!check_in || !check_out)) {
    return res.json({
      Status: false,
      Error: "יש להזין שעת כניסה ויציאה",
    });
  }

  const sql = `
    UPDATE attendance
    SET user_id = ?, date = ?, check_in = ?, check_out = ?, status = ?, notes = ?
    WHERE attendance_id = ?
  `;

  try {
    const [result] = await db.query(sql, [
      user_id,
      date,
      finalCheckIn,
      finalCheckOut,
      status,
      notes || null,
      id,
    ]);

    if (result.affectedRows === 0) {
      return res.json({
        Status: false,
        Error: "רשומת נוכחות לא נמצאה לעדכון",
      });
    }

    res.json({ Status: true, Message: "הרשומה עודכנה בהצלחה" });
  } catch (err) {
    console.error("שגיאה בעדכון נוכחות:", err);
    res.json({
      Status: false,
      Error: "שגיאה בעדכון הנתונים במסד",
    });
  }
});

// ✅ דוח היעדרויות אוטומטי (ל-cron) - קוד מתוקן
router.get("/generate-absence-report", async (req, res) => {
  const today = new Date().toISOString().split("T")[0];

  const sql = `
    SELECT u.user_id, u.first_name, u.last_name
    FROM users u
    LEFT JOIN attendance a
      ON u.user_id = a.user_id AND a.date = ?
    WHERE a.attendance_id IS NULL AND u.is_active = 1;
  `;

  try {
    const [result] = await db.query(sql, [today]);

    if (result.length === 0) {
      return res.json({
        Status: true,
        Message: "כל העובדים רשמו נוכחות היום.",
      });
    }

    console.log("📋 עובדים ללא נוכחות ב-" + today + ":");
    result.forEach((row) => {
      console.log(`- ${row.first_name} ${row.last_name} (ID: ${row.user_id})`);
    });

    res.json({
      Status: true,
      Missing: result,
      Message: `${result.length} עובדים ללא נוכחות בתאריך ${today}`,
    });
  } catch (err) {
    console.error("שגיאה בדוח חוסרי נוכחות:", err);
    res.status(500).json({ Status: false, Error: "שגיאת שרת" });
  }
});

export default router;

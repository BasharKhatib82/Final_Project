import express from "express";
import dbSingleton from "../utils/dbSingleton.js";
import verifyToken from "../utils/verifyToken.js";

const router = express.Router();
const connection = dbSingleton.getConnection();

// ✅ הוספת נוכחות
// ✅ הוספת נוכחות
router.post("/add", verifyToken, (req, res) => {
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

  // בדיקה אם קיימת רשומה לאותו עובד בתאריך הזה
  const checkSql = `SELECT * FROM attendance WHERE user_id = ? AND date = ?`;

  connection.query(checkSql, [user_id, date], (err, result) => {
    if (err) {
      console.error("שגיאה בבדיקת נוכחות קיימת:", err);
      return res.json({ Status: false, Error: "שגיאה בבדיקת נתונים" });
    }

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

    connection.query(
      insertSql,
      [user_id, date, finalCheckIn, finalCheckOut, status, notes || null],
      (err2) => {
        if (err2) {
          console.error("שגיאה בהוספת נוכחות:", err2);
          return res.json({
            Status: false,
            Error: "שגיאה בשמירה למסד הנתונים",
          });
        }

        res.json({ Status: true, Message: "הנוכחות נוספה בהצלחה" });
      }
    );
  });
});

// ✅ הצגת כל הנוכחויות
router.get("/", verifyToken, (req, res) => {
  const sql = `SELECT * FROM attendance ORDER BY date DESC`;
  connection.query(sql, (err, result) => {
    if (err) {
      console.error("שגיאה בשליפת נוכחויות:", err);
      return res.json({ Status: false, Error: "שגיאה בטעינת הנתונים" });
    }
    res.json({ Status: true, Result: result });
  });
});

// ✅ שליפה לפי מזהה
router.get("/:id", verifyToken, (req, res) => {
  const { id } = req.params;

  const sql = `SELECT * FROM attendance WHERE attendance_id = ?`;
  connection.query(sql, [id], (err, result) => {
    if (err) {
      console.error("שגיאה בשליפת נוכחות לפי ID:", err);
      return res.json({ Status: false, Error: "שגיאה בטעינת הנתונים" });
    }

    if (result.length === 0) {
      return res.json({
        Status: false,
        Error: "לא נמצאה רשומת נוכחות עם מזהה זה",
      });
    }

    res.json({ Status: true, Result: result[0] });
  });
});

// ✅ עדכון לפי מזהה
router.put("/edit/:id", verifyToken, (req, res) => {
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

  connection.query(
    sql,
    [user_id, date, finalCheckIn, finalCheckOut, status, notes || null, id],
    (err, result) => {
      if (err) {
        console.error("שגיאה בעדכון נוכחות:", err);
        return res.json({
          Status: false,
          Error: "שגיאה בעדכון הנתונים במסד",
        });
      }

      if (result.affectedRows === 0) {
        return res.json({
          Status: false,
          Error: "רשומת נוכחות לא נמצאה לעדכון",
        });
      }

      res.json({ Status: true, Message: "הרשומה עודכנה בהצלחה" });
    }
  );
});

// ✅ דוח היעדרויות אוטומטי (ל-cron)
router.get("/generate-absence-report", (req, res) => {
  const today = new Date().toISOString().split("T")[0];

  const sql = `
    SELECT u.user_id, u.first_name, u.last_name
    FROM users u
    LEFT JOIN attendance a
      ON u.user_id = a.user_id AND a.date = ?
    WHERE a.attendance_id IS NULL AND u.is_active = 1;
  `;

  connection.query(sql, [today], (err, result) => {
    if (err) {
      console.error("שגיאה בדוח חוסרי נוכחות:", err);
      return res.status(500).json({ Status: false, Error: "שגיאת שרת" });
    }

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
  });
});

export default router;

// backend\routes\attendanceRoutes.js
import express from "express";
import { db } from "../utils/dbSingleton.js";
import verifyToken from "../utils/verifyToken.js";

const router = express.Router();

// סטטוסים מיוחדים שלא נדרשת  עבורם שעת כניסה/יציאה
const SPECIAL_STATUSES = ["חופשה", "מחלה", "היעדרות"];

/**
 * פונקציית עזר שבודקת האם סטטוס נחשב מיוחד
 * @param {string} status - הסטטוס לבדיקה
 * @returns {boolean}
 */
const isSpecialStatus = (status) => SPECIAL_STATUSES.includes(status);

// החלת אימות טוקן על כל הראוטים
router.use(verifyToken);

/*****************************
 *       הוספת נוכחות       *
 *****************************/
router.post("/add", async (req, res) => {
  const { user_id, date, check_in, check_out, status, notes } = req.body;

  if (!user_id || !date || !status) {
    return res.status(400).json({
      Status: false,
      Error: "נא למלא את כל שדות החובה",
    });
  }

  try {
    const [existingAttendances] = await db.query(
      "SELECT * FROM attendance WHERE user_id = ? AND date = ?",
      [user_id, date]
    );

    const hasSameSpecial =
      isSpecialStatus(status) &&
      existingAttendances.filter((a) => a.status === status).length > 0;

    if (hasSameSpecial) {
      return res.json({
        Status: false,
        Error: `כבר קיימת נוכחות עם סטטוס "${status}" בתאריך זה.`,
      });
    }

    const hasTimeEntry =
      !isSpecialStatus(status) &&
      existingAttendances.filter((a) => a.check_in || a.check_out).length > 0;

    if (hasTimeEntry) {
      return res.json({
        Status: false,
        Error: "כבר קיימת נוכחות עם שעות לאותו עובד בתאריך זה.",
      });
    }

    if (existingAttendances.length > 0) {
      return res.json({
        Status: false,
        Error: "כבר קיימת רשומת נוכחות לעובד זה בתאריך זה.",
      });
    }

    const [insertResponse] = await db.query(
      `INSERT INTO attendance (user_id, date, check_in, check_out, status, notes)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        user_id,
        date,
        isSpecialStatus(status) ? null : check_in,
        isSpecialStatus(status) ? null : check_out,
        status,
        notes || null,
      ]
    );

    if (insertResponse.affectedRows === 1) {
      return res.json({
        Status: true,
        Message: "הנוכחות נוספה בהצלחה",
      });
    }

    return res.status(500).json({
      Status: false,
      Error: "הכנסת הנוכחות נכשלה",
    });
  } catch (err) {
    console.error("❌ [POST /add] שגיאה:", err);
    return res.status(500).json({
      Status: false,
      Error: "שגיאת שרת",
    });
  }
});

/*******************************************************
 *       שליפת כל הנוכחויות כולל פרטי העובדים       *
 *******************************************************/
router.get("/", async (_req, res) => {
  try {
    const [attendancesList] = await db.query(
      `SELECT a.attendance_id, a.user_id, u.first_name, u.last_name,
              a.date, a.check_in, a.check_out, a.status, a.notes
       FROM attendance a
       LEFT JOIN users u ON a.user_id = u.user_id
       ORDER BY a.date DESC`
    );

    return res.json({
      Status: true,
      Result: attendancesList,
    });
  } catch (err) {
    console.error("❌ [GET /] שגיאה:", err);
    return res.status(500).json({
      Status: false,
      Error: "שגיאת שרת",
    });
  }
});

/***************************************
 *       שליפת נוכחות לפי מזהה       *
 ***************************************/
router.get("/:id", async (req, res) => {
  const attendanceId = req.params.id;

  try {
    const [attendanceResult] = await db.query(
      "SELECT * FROM attendance WHERE attendance_id = ?",
      [attendanceId]
    );

    if (attendanceResult.length === 0) {
      return res.status(404).json({
        Status: false,
        Error: "לא נמצאה רשומת נוכחות עם מזהה זה",
      });
    }

    const attendance = attendanceResult[0];

    return res.json({
      Status: true,
      Result: attendance,
    });
  } catch (err) {
    console.error("❌ [GET /:id] שגיאה:", err);
    return res.status(500).json({
      Status: false,
      Error: "שגיאת שרת",
    });
  }
});

/***********************************
 *       עדכון רשומת נוכחות       *
 ***********************************/
router.put("/edit/:id", async (req, res) => {
  const { user_id, date, check_in, check_out, status, notes } = req.body;
  const attendanceId = req.params.id;

  if (!user_id || !date || !status) {
    return res.status(400).json({
      Status: false,
      Error: "נא למלא את כל שדות החובה",
    });
  }

  try {
    const [updateResponse] = await db.query(
      `UPDATE attendance
       SET user_id = ?, date = ?, check_in = ?, check_out = ?, status = ?, notes = ?
       WHERE attendance_id = ?`,
      [
        user_id,
        date,
        isSpecialStatus(status) ? null : check_in,
        isSpecialStatus(status) ? null : check_out,
        status,
        notes || null,
        attendanceId,
      ]
    );

    if (updateResponse.affectedRows === 0) {
      return res.status(404).json({
        Status: false,
        Error: "הרשומה לא נמצאה לעדכון",
      });
    }

    return res.json({
      Status: true,
      Message: "הנוכחות עודכנה בהצלחה",
    });
  } catch (err) {
    console.error("❌ [PUT /edit/:id] שגיאה:", err);
    return res.status(500).json({
      Status: false,
      Error: "שגיאת שרת",
    });
  }
});

/*******************************************
 *       דוח היעדרויות ליום הנוכחי       *
 *******************************************/
router.get("/generate-absence-report", async (_req, res) => {
  const today = new Date().toISOString().split("T")[0];

  try {
    const [usersList] = await db.query(
      `SELECT u.user_id, u.first_name, u.last_name
       FROM users u
       LEFT JOIN attendance a ON u.user_id = a.user_id AND a.date = ?
       WHERE a.attendance_id IS NULL AND u.active = 1`,
      [today]
    );

    if (usersList.length === 0) {
      return res.json({
        Status: true,
        Message: "כל העובדים רשמו נוכחות היום.",
      });
    }

    return res.json({
      Status: true,
      Missing: usersList,
      Message: `${usersList.length} עובדים ללא נוכחות בתאריך ${today}`,
    });
  } catch (err) {
    console.error("❌ [GET /generate-absence-report] שגיאה:", err);
    return res.status(500).json({
      Status: false,
      Error: "שגיאת שרת",
    });
  }
});

/***************************************************************
 *       החתמת כניסה – יצירת נוכחות עם שעת כניסה בלבד       *
 ***************************************************************/
router.post("/check-in", async (req, res) => {
  const { user_id } = req.body;

  if (!user_id) {
    return res.status(400).json({
      Status: false,
      Error: "חסר מזהה משתמש",
    });
  }

  const today = new Date().toISOString().split("T")[0];

  try {
    const [existingAttendances] = await db.query(
      "SELECT * FROM attendance WHERE user_id = ? AND date = ?",
      [user_id, today]
    );

    if (existingAttendances.length > 0) {
      return res.status(400).json({
        Status: false,
        Error: "כבר קיימת נוכחות עבור היום",
      });
    }

    const [insertResponse] = await db.query(
      `INSERT INTO attendance (user_id, date, check_in, status)
       VALUES (?, ?, NOW(), ?)`,
      [user_id, today, "עובד"]
    );

    if (insertResponse.affectedRows === 1) {
      return res.json({
        Status: true,
        Message: "שעת כניסה נרשמה בהצלחה",
      });
    }

    return res.status(500).json({
      Status: false,
      Error: "החתמת כניסה נכשלה",
    });
  } catch (err) {
    console.error("❌ [POST /check-in] שגיאה:", err);
    return res.status(500).json({
      Status: false,
      Error: "שגיאת שרת",
    });
  }
});

/*******************************************************************
 *    החתמת יציאה – עדכון שעת יציאה לרשומת הנוכחות של היום     *
 *******************************************************************/
router.post("/check-out", async (req, res) => {
  const { user_id } = req.body;

  if (!user_id) {
    return res.status(400).json({
      Status: false,
      Error: "חסר מזהה משתמש",
    });
  }

  const today = new Date().toISOString().split("T")[0];

  try {
    const [attendancesList] = await db.query(
      `SELECT * FROM attendance
       WHERE user_id = ? AND date = ?`,
      [user_id, today]
    );

    if (attendancesList.length === 0) {
      return res.status(400).json({
        Status: false,
        Error: "לא קיימת נוכחות להיום – יש להחתים כניסה קודם",
      });
    }

    const attendance = attendancesList[0];

    if (attendance.check_out) {
      return res.status(400).json({
        Status: false,
        Error: "כבר בוצעה החתמת יציאה להיום",
      });
    }

    const [updateResponse] = await db.query(
      `UPDATE attendance
       SET check_out = NOW()
       WHERE attendance_id = ?`,
      [attendance.attendance_id]
    );

    if (updateResponse.affectedRows === 1) {
      return res.json({
        Status: true,
        Message: "שעת יציאה נרשמה בהצלחה",
      });
    }

    return res.status(500).json({
      Status: false,
      Error: "החתמת יציאה נכשלה",
    });
  } catch (err) {
    console.error("❌ [POST /check-out] שגיאה:", err);
    return res.status(500).json({
      Status: false,
      Error: "שגיאת שרת",
    });
  }
});

export default router;

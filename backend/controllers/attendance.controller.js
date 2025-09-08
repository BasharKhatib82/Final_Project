// controllers/attendance.controller.js

import { db } from "../utils/dbSingleton.js";
import { isSpecialStatus, isValidDate } from "../utils/attendanceHelpers.js";
import { isNineDigitId } from "../utils/fieldValidators.js";

/**
 * הוספת נוכחות
 * מקבל: { user_id, date, status, check_in?, check_out?, notes? }
 * מחזיר: הצלחה/שגיאה
 */
export async function addAttendance(req, res) {
  const { user_id, date, check_in, check_out, status, notes } = req.body;

  if (!user_id || !date || !status) {
    return res
      .status(400)
      .json({ success: false, message: "נא למלא את כל שדות החובה" });
  }
  if (!isNineDigitId(user_id)) {
    return res
      .status(400)
      .json({
        success: false,
        message: "תעודת זהות חייבת להיות מספר בן 9 ספרות",
      });
  }
  if (!isValidDate(date)) {
    return res.status(400).json({ success: false, message: "תאריך לא תקין" });
  }

  try {
    // מדיניות: רשומת נוכחות אחת למשתמש ליום
    const [exists] = await db.query(
      "SELECT attendance_id FROM attendance WHERE user_id = ? AND date = ?",
      [user_id, date]
    );
    if (exists.length > 0) {
      return res.status(409).json({
        success: false,
        message: "כבר קיימת רשומת נוכחות לעובד זה בתאריך זה",
      });
    }

    const [insert] = await db.query(
      `INSERT INTO attendance (user_id, date, check_in, check_out, status, notes)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        user_id,
        date,
        isSpecialStatus(status) ? null : check_in || null,
        isSpecialStatus(status) ? null : check_out || null,
        status,
        notes || null,
      ]
    );

    if (insert.affectedRows === 1) {
      return res.json({ success: true, message: "הנוכחות נוספה בהצלחה" });
    }
    return res
      .status(500)
      .json({ success: false, message: "הכנסת הנוכחות נכשלה" });
  } catch (err) {
    console.error("addAttendance:", err);
    return res.status(500).json({ success: false, message: "שגיאת שרת" });
  }
}

/**
 * שליפת כל הנוכחויות (כולל פרטי עובדים)
 * מקבל : כלום
 * מחזיר: מערך רשומות נוכחות
 */
export async function listAttendances(_req, res) {
  try {
    const [rows] = await db.query(
      `SELECT a.attendance_id, a.user_id, u.first_name, u.last_name,
              a.date, a.check_in, a.check_out, a.status, a.notes
       FROM attendance a
       LEFT JOIN users u ON a.user_id = u.user_id
       ORDER BY a.date DESC`
    );
    return res.json({ success: true, data: rows });
  } catch (err) {
    console.error("listAttendances:", err);
    return res.status(500).json({ success: false, message: "שגיאת שרת" });
  }
}

/**
 * שליפת נוכחות לפי מזהה
 * מקבל: :id
 * מחזיר: רשומת נוכחות אחת
 */
export async function getAttendanceById(req, res) {
  const attendanceId = req.params.id;
  try {
    const [rows] = await db.query(
      "SELECT * FROM attendance WHERE attendance_id = ?",
      [attendanceId]
    );
    if (rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "לא נמצאה רשומת נוכחות עם מזהה זה" });
    }
    return res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error("getAttendanceById:", err);
    return res.status(500).json({ success: false, message: "שגיאת שרת" });
  }
}

/**
 * עדכון רשומת נוכחות
 * מקבל: :id , ו { user_id, date, status, check_in?, check_out?, notes? }
 * מחזיר: הצלחה/שגיאה
 */
export async function updateAttendance(req, res) {
  const attendanceId = req.params.id;
  const { user_id, date, check_in, check_out, status, notes } = req.body;

  if (!user_id || !date || !status) {
    return res
      .status(400)
      .json({ success: false, message: "נא למלא את כל שדות החובה" });
  }
  if (!isNineDigitId(user_id)) {
    return res
      .status(400)
      .json({
        success: false,
        message: "תעודת זהות חייב להיות מספר בן 9 ספרות",
      });
  }
  if (!isValidDate(date)) {
    return res.status(400).json({ success: false, message: "תאריך לא תקין" });
  }

  try {
    //  בדוק שאין כפילות באותו יום
    const [dups] = await db.query(
      `SELECT attendance_id FROM attendance
       WHERE user_id = ? AND date = ? AND attendance_id <> ?`,
      [user_id, date, attendanceId]
    );
    if (dups.length > 0) {
      return res.status(409).json({
        success: false,
        message: "כבר קיימת נוכחות לעובד זה בתאריך זה",
      });
    }

    const [update] = await db.query(
      `UPDATE attendance
       SET user_id = ?, date = ?, check_in = ?, check_out = ?, status = ?, notes = ?
       WHERE attendance_id = ?`,
      [
        user_id,
        date,
        isSpecialStatus(status) ? null : check_in || null,
        isSpecialStatus(status) ? null : check_out || null,
        status,
        notes || null,
        attendanceId,
      ]
    );

    if (update.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "הרשומה לא נמצאה לעדכון" });
    }

    return res.json({ success: true, message: "הנוכחות עודכנה בהצלחה" });
  } catch (err) {
    console.error("updateAttendance:", err);
    return res.status(500).json({ success: false, message: "שגיאת שרת" });
  }
}

/**
 * דוח היעדרויות להיום
 * מקבל: כלום
 * מחזיר: רשימת משתמשים ללא נוכחות להיום
 */
export async function generateAbsenceReport(_req, res) {
  const today = new Date().toISOString().split("T")[0];
  try {
    const [rows] = await db.query(
      `SELECT u.user_id, u.first_name, u.last_name
       FROM users u
       LEFT JOIN attendance a ON u.user_id = a.user_id AND a.date = ?
       WHERE a.attendance_id IS NULL AND u.active = 1`,
      [today]
    );

    return res.json({
      success: true,
      data: rows,
      message:
        rows.length === 0
          ? "כל העובדים רשמו נוכחות היום."
          : `${rows.length} עובדים ללא נוכחות בתאריך ${today}`,
    });
  } catch (err) {
    console.error("❌ generateAbsenceReport:", err);
    return res.status(500).json({ success: false, message: "שגיאת שרת" });
  }
}

/**
 * החתמת כניסה
 * מקבל: { user_id }
 * מחזיר: הצלחה/שגיאה
 */
export async function checkIn(req, res) {
  const { user_id } = req.body;
  if (!user_id) {
    return res.status(400).json({ success: false, message: "חסר מזהה משתמש" });
  }
  if (!isNineDigitId(user_id)) {
    return res
      .status(400)
      .json({
        success: false,
        message: "תעודת זהות חייבת להיות מספר בן 9 ספרות",
      });
  }

  const today = new Date().toISOString().split("T")[0];

  try {
    const [exists] = await db.query(
      "SELECT attendance_id FROM attendance WHERE user_id = ? AND date = ?",
      [user_id, today]
    );
    if (exists.length > 0) {
      return res
        .status(400)
        .json({ success: false, message: "כבר קיימת נוכחות עבור היום" });
    }

    const [insert] = await db.query(
      `INSERT INTO attendance (user_id, date, check_in, status)
       VALUES (?, ?, NOW(), ?)`,
      [user_id, today, "עובד"]
    );

    if (insert.affectedRows === 1) {
      return res.json({ success: true, message: "שעת כניסה נרשמה בהצלחה" });
    }
    return res
      .status(500)
      .json({ success: false, message: "החתמת כניסה נכשלה" });
  } catch (err) {
    console.error("checkIn:", err);
    return res.status(500).json({ success: false, message: "שגיאת שרת" });
  }
}

/**
 * החתמת יציאה
 * מקבל: { user_id }
 * מחזיר: הצלחה/שגיאה
 */
export async function checkOut(req, res) {
  const { user_id } = req.body;
  if (!user_id) {
    return res.status(400).json({ success: false, message: "חסר מזהה משתמש" });
  }
  if (!isNineDigitId(user_id)) {
    return res
      .status(400)
      .json({
        success: false,
        message: "מספר תעודת זהות חייבת להיות מספר בן 9 ספרות",
      });
  }

  const today = new Date().toISOString().split("T")[0];

  try {
    const [rows] = await db.query(
      `SELECT attendance_id, check_out FROM attendance
       WHERE user_id = ? AND date = ?`,
      [user_id, today]
    );

    if (rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: "לא קיימת נוכחות להיום – יש להחתים כניסה קודם",
      });
    }

    if (rows[0].check_out) {
      return res
        .status(400)
        .json({ success: false, message: "כבר בוצעה החתמת יציאה להיום" });
    }

    const [update] = await db.query(
      `UPDATE attendance SET check_out = NOW() WHERE attendance_id = ?`,
      [rows[0].attendance_id]
    );

    if (update.affectedRows === 1) {
      return res.json({ success: true, message: "שעת יציאה נרשמה בהצלחה" });
    }
    return res
      .status(500)
      .json({ success: false, message: "החתמת יציאה נכשלה" });
  } catch (err) {
    console.error("checkOut:", err);
    return res.status(500).json({ success: false, message: "שגיאת שרת" });
  }
}

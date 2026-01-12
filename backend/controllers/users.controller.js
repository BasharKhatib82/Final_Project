// backend\controllers\users.controller.js

import bcrypt from "bcryptjs";
import { db } from "../utils/dbSingleton.js";
import logAction from "../utils/logAction.js";
import getUserFullName from "../utils/getUserFullName.js";
import {
  isNineDigitId,
  isILPhone10,
  isPositiveInt,
} from "../utils/fieldValidators.js";
import { validateAndSanitizeEmail } from "../utils/validateAndSanitizeEmail.js";

/**
 * הוספת משתמש חדש
 * {user_id, first_name, last_name, email, role_id, password, phone_number?, notes?} : מקבל
 * מחזיר: הצלחה או שגיאה
 */
export async function addUser(req, res) {
  let {
    user_id,
    first_name,
    last_name,
    phone_number,
    email,
    role_id,
    password,
    notes,
  } = req.body;

  // שדות חובה
  if (
    !user_id ||
    !first_name ||
    !last_name ||
    !email ||
    !role_id ||
    !password
  ) {
    return res.status(400).json({ success: false, message: "שדות חובה חסרים" });
  }

  // תעודת זהות – 9 ספרות
  if (!isNineDigitId(user_id)) {
    return res.status(400).json({
      success: false,
      message: "תעודת זהות חייבת להיות מספר בן 9 ספרות בדיוק",
    });
  }

  // מזהה תפקיד – מספר שלם חיובי (יכול להגיע כמחרוזת, לכן בדיקת טקסט)
  if (!isPositiveInt(role_id)) {
    return res
      .status(400)
      .json({ success: false, message: "מזהה תפקיד חייב להיות מספר חיובי" });
  }

  // מספר טלפון – אם נשלח, חייב להיות 10 ספרות בדיוק ויתחיל ב 05
  if (
    phone_number != null &&
    phone_number !== "" &&
    !isILPhone10(phone_number)
  ) {
    return res.status(400).json({
      success: false,
      message: "מספר טלפון חייב להיות 10 ספרות ולהתחיל ב 05",
    });
  }

  // אימייל
  try {
    email = validateAndSanitizeEmail(email);
  } catch (e) {
    return res
      .status(400)
      .json({ success: false, message: e?.message || "אימייל לא תקין" });
  }

  try {
    // בדיקת כפילויות
    const [existing] = await db.query(
      "SELECT user_id FROM users WHERE user_id = ? OR email = ? OR phone_number = ?",
      [user_id, email, phone_number || null]
    );
    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: "המשתמש כבר קיים במערכת לפי : ת.ז / אימייל / טלפון",
      });
    }

    // הצפנת סיסמה
    const hash = await bcrypt.hash(password, 10);

    const sql = `
      INSERT INTO users 
      (user_id, first_name, last_name, phone_number, email, role_id, password, last_password_change, notes, active) 
      VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), ?, 1)
    `;

    const [result] = await db.query(sql, [
      user_id,
      first_name,
      last_name,
      phone_number || null,
      email,
      Number(role_id), // שמירה כמספר
      hash,
      notes || null,
    ]);

    if (result.affectedRows !== 1) {
      return res
        .status(500)
        .json({ success: false, message: "הוספת המשתמש נכשלה" });
    }

    logAction(
      `הוספת משתמש חדש : ${last_name} ${first_name}`,
      req.user?.user_id
    )(req, res, () => {});
    return res.json({ success: true, message: "המשתמש נוסף בהצלחה" });
  } catch (err) {
    console.error("שגיאה בהוספת משתמש:", err);

    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        success: false,
        message: "המשתמש כבר קיים במערכת לפי : ת.ז / אימייל / טלפון",
      });
    }

    return res.status(500).json({ success: false, message: "שגיאת שרת" });
  }
}

/**
 * עדכון משתמש
 * first_name, last_name, email, role_id, phone_number?, notes?, active? בגוף + בפרמטרים  id : מקבל
 * מחזיר: הצלחה או שגיאה
 */
export async function updateUser(req, res) {
  const userId = req.params.id;

  // תעודת זהות חייבת להיות 9 ספרות
  if (!isNineDigitId(userId)) {
    return res.status(400).json({
      success: false,
      message: "תעודת זהות חייב להיות מספר בן 9 ספרות",
    });
  }

  // חסימת עדכון למשתמש-על
  if (Number(userId) === 1) {
    return res
      .status(403)
      .json({ success: false, message: "עריכת פרטי מנהל כללי חסומה" });
  }

  let { first_name, last_name, phone_number, email, role_id, notes, active } =
    req.body;

  // שדות חובה
  if (!first_name || !last_name || !email || role_id == null) {
    return res.status(400).json({ success: false, message: "שדות חובה חסרים" });
  }

  // מזהה תפקיד – מספר חיובי
  if (!isPositiveInt(role_id)) {
    return res
      .status(400)
      .json({ success: false, message: "מזהה תפקיד חייב להיות מספר חיובי" });
  }

  // מספר טלפון חייב להיות 10 ספרות ולהתחיל ב 05
  if (
    phone_number != null &&
    phone_number !== "" &&
    !isILPhone10(phone_number)
  ) {
    return res.status(400).json({
      success: false,
      message: "מספר טלפון חייב להיות 10 ספרות ולהתחיל ב 05",
    });
  }

  // אימייל
  try {
    email = validateAndSanitizeEmail(email);
  } catch (e) {
    return res
      .status(400)
      .json({ success: false, message: e?.message || "אימייל לא תקין" });
  }

  try {
    // בדיקת כפילות : אימייל ו טלפון למשתמש אחר
    const [dups] = await db.query(
      `
        SELECT user_id
        FROM users
        WHERE (email = ? OR (phone_number IS NOT NULL AND phone_number = ?))
          AND user_id <> ?
      `,
      [email, phone_number || null, userId]
    );
    if (dups.length > 0) {
      return res.status(409).json({
        success: false,
        message: " פרטי משתמש מתנגשים : אימייל או טלפון שייכים למשתמש אחר)",
      });
    }

    // עדכון בפועל
    const [result] = await db.query(
      `
        UPDATE users SET
          first_name = ?, 
          last_name  = ?, 
          phone_number = ?, 
          email = ?,
          role_id = ?, 
          notes = ?, 
          active = ?
        WHERE user_id = ?
      `,
      [
        first_name,
        last_name,
        phone_number || null,
        email,
        Number(role_id),
        notes || null,
        active ?? 1,
        userId,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "משתמש לא נמצא" });
    }
    const fullName = await getUserFullName(userId);
    logAction(`עדכון פרטי משתמש : " ${fullName} "`, req.user?.user_id)(
      req,
      res,
      () => {}
    );
    return res.json({ success: true, message: "המשתמש עודכן בהצלחה" });
  } catch (err) {
    console.error("שגיאה בעדכון משתמש:", err);

    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        success: false,
        message: "פרטי משתמש מתנגשים : אימייל או טלפון כפולים)",
      });
    }

    return res.status(500).json({ success: false, message: "שגיאת שרת" });
  }
}

/**
 * מחיקה לוגית של משתמש (active = 0)
 * בדיקות:
 * - חסימת מנהל כללי
 * - משימות (tasks.user_id)
 * - פניות (leads.user_id)
 */
export async function deleteUser(req, res) {
  const userId = parseInt(req.params.id, 10);

  if (!Number.isInteger(userId) || userId <= 0) {
    return res
      .status(400)
      .json({ success: false, message: "מזהה משתמש לא תקין" });
  }

  // חסימת מנהל כללי
  if (userId === 1) {
    return res
      .status(403)
      .json({ success: false, message: "מחיקת מנהל כללי חסומה" });
  }

  try {
    // 🔹 בדיקת משימות
    const [tasks] = await db.query(
      `SELECT COUNT(*) AS total FROM tasks WHERE user_id = ?`,
      [userId]
    );

    if (tasks[0].total > 0) {
      return res.status(409).json({
        success: false,
        reason: "tasks",
        message: "לא ניתן להשבית משתמש המשויך למשימות קיימות",
      });
    }

    // 🔹 בדיקת פניות
    const [leads] = await db.query(
      `SELECT COUNT(*) AS total FROM leads WHERE user_id = ?`,
      [userId]
    );

    if (leads[0].total > 0) {
      return res.status(409).json({
        success: false,
        reason: "leads",
        message: "לא ניתן להשבית משתמש המשויך לפניות קיימות",
      });
    }

    // 🔹 מחיקה לוגית
    const [result] = await db.query(
      "UPDATE users SET active = 0 WHERE user_id = ?",
      [userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "משתמש לא נמצא" });
    }

    logAction(`השבתת משתמש #${userId}`, req.user?.user_id)(req, res, () => {});
    return res.json({
      success: true,
      message: "המשתמש הושבת בהצלחה",
    });
  } catch (err) {
    console.error("שגיאה בהשבתת משתמש:", err);
    return res.status(500).json({
      success: false,
      message: "שגיאת שרת בהשבתת משתמש",
    });
  }
}

/**
 * שליפת כל המשתמשים הפעילים
 */
export async function getActiveUsers(_req, res) {
  try {
    const [rows] = await db.query(`
      SELECT u.user_id, u.first_name, u.last_name, u.phone_number,
             u.email, u.role_id, r.role_name, u.notes, u.active
      FROM users u
      LEFT JOIN roles_permissions r ON u.role_id = r.role_id
      WHERE u.active = 1
    `);
    return res.json({ success: true, data: rows });
  } catch (err) {
    console.error("שגיאה בשליפת משתמשים פעילים:", err);
    return res.status(500).json({ success: false, message: "שגיאת שרת" });
  }
}

/**
 * שליפת משתמשים לא פעילים
 */
export async function getInactiveUsers(_req, res) {
  try {
    const [rows] = await db.query(`
      SELECT u.user_id, u.first_name, u.last_name, u.phone_number,
             u.email, u.role_id, r.role_name, u.notes, u.active
      FROM users u
      LEFT JOIN roles_permissions r ON u.role_id = r.role_id
      WHERE u.active = 0
    `);
    return res.json({ success: true, data: rows });
  } catch (err) {
    console.error("שגיאה בשליפת משתמשים לא פעילים:", err);
    return res.status(500).json({ success: false, message: "שגיאת שרת" });
  }
}

/**
 * שליפת משתמש לפי מזהה
 */
export async function getUserById(req, res) {
  const userId = req.params.id;

  try {
    const [rows] = await db.query(
      `
      SELECT u.user_id, u.first_name, u.last_name, u.phone_number,
             u.email, u.role_id, r.role_name, u.notes, u.active
      FROM users u
      LEFT JOIN roles_permissions r ON u.role_id = r.role_id
      WHERE u.user_id = ?
    `,
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "משתמש לא נמצא" });
    }

    return res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error("שגיאה בשליפת משתמש:", err);
    return res.status(500).json({ success: false, message: "שגיאת שרת" });
  }
}

/**
 * שינוי סיסמה למשתמש
 * בגוף {currentPassword, newPassword} + בפרמטרים id : מקבל
 */
export async function changeUserPassword(req, res) {
  const { id } = req.params;
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      success: false,
      message: "יש להזין סיסמה נוכחית וסיסמה חדשה",
    });
  }

  try {
    const [rows] = await db.query(
      "SELECT password FROM users WHERE user_id = ?",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "משתמש לא נמצא" });
    }

    const isMatch = await bcrypt.compare(currentPassword, rows[0].password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "סיסמה נוכחית שגויה",
      });
    }

    const newHashed = await bcrypt.hash(newPassword, 10);

    const [result] = await db.query(
      "UPDATE users SET password = ?, last_password_change = NOW() WHERE user_id = ?",
      [newHashed, id]
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "משתמש לא נמצא לעדכון" });
    }

    logAction(`בוצע איפוס סיסמה למשתמש`, req.user?.user_id)(req, res, () => {});
    return res.json({ success: true, message: "הסיסמה עודכנה בהצלחה" });
  } catch (err) {
    console.error("שגיאה בשינוי סיסמה:", err);
    return res
      .status(500)
      .json({ success: false, message: "שגיאת שרת בשינוי סיסמה" });
  }
}

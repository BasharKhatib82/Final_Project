import { db } from "../utils/dbSingleton.js";
import express from "express";
import jwt from "jsonwebtoken";
import verifyToken from "../utils/verifyToken.js";
import { setAuthCookie, clearAuthCookie } from "../utils/authCookies.js";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import nodemailer from "nodemailer";
import logAction from "../utils/logAction.js";
import { roleFields, roleFieldsSQL } from "../utils/permissions.js";

const router = express.Router();

// **************************** /
//        התחברות משתמש        /
// **************************** /
/**
 * מה עושה: מבצע התחברות, מאמת סיסמה, יוצר טוקן ושומר אותו כקוקי מאובטח.
 *   (Body) מה { user_id, password }  מקבל
 *  מחזיר: { success, message, data:user } או דרישת החלפת סיסמה.
 */
router.post("/login", async (req, res) => {
  const { user_id, password } = req.body;

  // ולידציה בסיסית לשדות חובה
  if (!user_id || !password) {
    return res.status(400).json({
      success: false,
      message: "יש להזין מזהה משתמש וסיסמה",
    });
  }

  try {
    const query = `
      SELECT u.*, r.role_name, ${roleFieldsSQL}
      FROM users u
      JOIN roles_permissions r ON u.role_id = r.role_id
      WHERE u.user_id = ?
    `;
    const [usersList] = await db.query(query, [user_id]);

    if (usersList.length === 0) {
      return res.status(401).json({
        success: false,
        message: "מזהה המשתמש לא רשום במערכת",
      });
    }

    const user = usersList[0];

    /**
     * bcrypt.compare – פונקציה שמשווה סיסמה  ל־ hash שמור.
     * מחזירה boolean המייצג האם יש התאמה.
     */
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "נראה שהסיסמה שהוזנה שגויה",
      });
    }

    // בדיקה אם עברו 90 ימים משינוי סיסמה אחרון
    if (user.last_password_change) {
      const daysSince =
        Math.floor(
          (Date.now() - new Date(user.last_password_change).getTime()) /
            (1000 * 60 * 60 * 24)
        ) || 0;

      if (daysSince >= 90) {
        /**
         * randomBytes – פונקציה מ־ crypto ליצירת טוקן אקראי מאובטח.
         * toString("hex") – המרה להקסה עבור שימוש נוח ב־ .
         */
        const resetToken = randomBytes(32).toString("hex");
        const resetExpireAt = new Date(Date.now() + 1000 * 60 * 15); // 15 דקות

        const [insertReset] = await db.query(
          "INSERT INTO password_resets (user_id, reset_token, reset_expires) VALUES (?, ?, ?)",
          [user.user_id, resetToken, resetExpireAt]
        );

        // affectedRows – כמה שורות הושפעו מה־ INSERT
        if (insertReset.affectedRows !== 1) {
          return res.status(500).json({
            success: false,
            message: "לא ניתן לייצר טוקן לאיפוס סיסמה",
          });
        }

        return res.json({
          success: false,
          mustChangePassword: true,
          resetToken,
          message: "עברו 90 יום מאז שינוי הסיסמה. יש להגדיר סיסמה חדשה.",
        });
      }
    }

    /**
     * jwt.sign – יוצר מחרוזת JWT חתומה (Token).
     * expiresIn: "1h" – תוקף הטוקן לשעה.
     */
    const tokenPayload = {
      user_id: user.user_id,
      role_id: user.role_id,
      full_name: `${user.first_name} ${user.last_name}`,
    };
    roleFields.forEach((f) => (tokenPayload[f] = user[f]));

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    // כתיבת הטוקן כ־ HttpOnly Cookie מאובטח
    setAuthCookie(res, token);

    // מחיקת טוקנים קודמים למשתמש וכתיבת הפעיל
    await db.query("DELETE FROM active_tokens WHERE user_id = ?", [
      user.user_id,
    ]);
    const [insertActive] = await db.query(
      "INSERT INTO active_tokens (token, user_id) VALUES (?, ?)",
      [token, user.user_id]
    );
    // affectedRows – ודא שהטוקן נשמר
    if (insertActive.affectedRows !== 1) {
      return res.status(500).json({
        success: false,
        message: "שגיאה בשמירת הטוקן",
      });
    }

    // לוג מערכת – התחברות
    logAction("התחברות למערכת", user.user_id)(req, res, () => {});

    return res.json({
      success: true,
      message: "התחברת בהצלחה",
      data: {
        user_id: user.user_id,
        role_id: user.role_id,
        first_name: user.first_name,
        last_name: user.last_name,
        role_name: user.role_name,
        ...roleFields.reduce((acc, f) => ({ ...acc, [f]: user[f] }), {}),
      },
    });
  } catch (err) {
    console.error("❌ שגיאה כללית בהתחברות:", err);
    return res.status(500).json({ success: false, message: "שגיאת שרת" });
  }
});

// ********************************************** /
//                בדיקת התחברות                 /
// ********************************************** /
/**
 * מה עושה: מחזיר את פרטי המשתמש מתוך ה־JWT (אם תקף).
 * מה מקבל: אין (נדרש Cookie עם token).
 * מה מחזיר: { success, data:user }
 */
router.get("/me", verifyToken, (req, res) => {
  return res.status(200).json({
    success: true,
    data: req.user || null,
  });
});

// ********************************************** /
//              התנתקות מהמערכת                  /
// ********************************************** /
/**
 * מה עושה: מוחק טוקן פעיל מה־ DB ומנקה קוקי.
 * מה מקבל (Body): { user_id? }
 * מה מחזיר: { success, message }
 */
router.post("/logout", async (req, res) => {
  const token = req.cookies?.token;
  const userIdFromBody = req.body?.user_id;
  let decodedUserId = null;

  try {
    if (token) {
      try {
        /**
         * jwt.verify – מאמת ומפענח JWT. אם הטוקן לא תקף תיזרק שגיאה.
         * כאן עוטפים ב־ try/catch כדי לא להפיל את הראוט.
         */
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        decodedUserId = decoded?.user_id || null;
      } catch {
        // מתעלמים משגיאת אימות טוקן לצורך מחיקה לפי user_id
      }

      // מחיקה לפי טוקן מהטבלה
      const [deleteByToken] = await db.query(
        "DELETE FROM active_tokens WHERE token = ?",
        [token]
      );

      /**
       * affectedRows – כמה שורות נמחקו בפועל.
       * אם 0 – לא נמצא לפי טוקן, ננסה למחוק לפי user_id (fallback).
       */
      const fallbackUserId = userIdFromBody || decodedUserId;
      if (deleteByToken.affectedRows === 0 && fallbackUserId) {
        await db.query("DELETE FROM active_tokens WHERE user_id = ?", [
          fallbackUserId,
        ]);
      }

      // לוג יציאה
      const uidForLog = decodedUserId || userIdFromBody || null;
      if (uidForLog) {
        logAction("התנתקות מהמערכת", uidForLog)(req, res, () => {});
      }
    } else {
      // אין טוקן בקוקי – מחיקה לפי user_id אם קיים
      if (userIdFromBody) {
        await db.query("DELETE FROM active_tokens WHERE user_id = ?", [
          userIdFromBody,
        ]);
        logAction("התנתקות מהמערכת", userIdFromBody)(req, res, () => {});
      }
    }
  } catch (err) {
    console.error("❌ שגיאה במחיקת טוקן:", err);
    // לא מפילים את התגובה – ממשיכים לנקות קוקי ולהחזיר הצלחה
  }

  clearAuthCookie(res);
  return res.json({ success: true, message: "התנתקת מהמערכת" });
});

// ********************************************** /
//      איפוס סיסמה - שליחת מייל עם טוקן         /
// ********************************************** /
/**
 * מה עושה: יוצר טוקן איפוס 15 דק׳ ושולח קישור במייל.
 * מה מקבל (Body): { email }
 * מה מחזיר: { success, message }
 */
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: "יש להזין כתובת אימייל",
    });
  }

  try {
    const [usersList] = await db.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);

    if (!usersList.length) {
      return res
        .status(404)
        .json({ success: false, message: "לא נמצא משתמש עם האימייל הזה" });
    }

    const user = usersList[0];
    const resetToken = randomBytes(32).toString("hex");
    const resetExpireAt = new Date(Date.now() + 1000 * 60 * 15); // 15 דקות

    const [insertReset] = await db.query(
      "INSERT INTO password_resets (user_id, reset_token, reset_expires) VALUES (?, ?, ?)",
      [user.user_id, resetToken, resetExpireAt]
    );

    if (insertReset.affectedRows !== 1) {
      return res.status(500).json({
        success: false,
        message: "אירעה שגיאה ביצירת טוקן האיפוס",
      });
    }

    // הגדרת מוביל מייל
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    await transporter.sendMail({
      from: `"מערכת CRM" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "איפוס סיסמה",
      html: `<p>לחץ על הלינק לאיפוס סיסמה:</p><a href="${resetLink}">${resetLink}</a>`,
    });

    return res.json({
      success: true,
      message: "נשלח מייל עם לינק לאיפוס סיסמה",
    });
  } catch (err) {
    console.error("❌ שגיאת איפוס (forgot-password):", err);
    return res.status(500).json({ success: false, message: "שגיאת שרת" });
  }
});

// ********************************************** /
//               איפוס סיסמה בפועל               /
// ********************************************** /
/**
 * מה עושה: מאמת טוקן איפוס בתוקף ומעדכן סיסמה חדשה.
 * מה מקבל (Body): { token, password }
 * מה מחזיר: { success, message }
 */
router.post("/reset-password", async (req, res) => {
  const { token, password } = req.body;

  if (!token || !password) {
    return res.status(400).json({
      success: false,
      message: "טוקן וסיסמה הם שדות חובה",
    });
  }

  try {
    const [resetRows] = await db.query(
      "SELECT * FROM password_resets WHERE reset_token = ? AND reset_expires > NOW() ORDER BY id DESC LIMIT 1",
      [token]
    );

    if (!resetRows.length) {
      return res.status(400).json({
        success: false,
        message: "הטוקן לא תקף או פג תוקפו",
      });
    }

    const resetData = resetRows[0];

    // הצפנת סיסמה
    const hashedPassword = await bcrypt.hash(password, 10);

    const [updateUser] = await db.query(
      "UPDATE users SET password = ?, last_password_change = NOW() WHERE user_id = ?",
      [hashedPassword, resetData.user_id]
    );

    /**
     * affectedRows – כמה שורות עודכנו.
     * אם 0 – המשתמש לא קיים או שלא בוצע שינוי.
     */
    if (updateUser.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "המשתמש לא נמצא לעדכון סיסמה",
      });
    }

    const [deleteReset] = await db.query(
      "DELETE FROM password_resets WHERE id = ?",
      [resetData.id]
    );
    // optional: נוודא שנמחקה רשומת האיפוס
    if (deleteReset.affectedRows !== 1) {
      // לא חוסם הצלחה – רק לוג
      console.warn("אזהרה: רשומת איפוס לא נמחקה (id=%s)", resetData.id);
    }

    return res.json({ success: true, message: "הסיסמה שונתה בהצלחה" });
  } catch (err) {
    console.error("❌ שגיאת Reset (reset-password):", err);
    return res.status(500).json({ success: false, message: "שגיאת שרת" });
  }
});

export default router;

// backend\controllers\auth.controller.js

import { db } from "../utils/dbSingleton.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { setAuthCookie, clearAuthCookie } from "../utils/authCookies.js";
import logAction from "../utils/logAction.js";
import { roleFields, roleFieldsSQL } from "../utils/permissions.js";
import { sendResetPasswordEmail } from "../services/email.service.js";
import { getDaysSince, generateResetToken } from "../utils/passwordHelpers.js";
import { validateAndSanitizeEmail } from "../utils/validateAndSanitizeEmail.js";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";

dayjs.extend(utc);
dayjs.extend(timezone);

/**
 * התחברות משתמש
 * מגוף הבקשה { user_id, password } : מקבל
 * בקוקי ונתוני משתמש, או דרישה להחלפת סיסמה JWT מחזיר: טוקן
 */
export async function login(req, res) {
  const { user_id, password } = req.body;
  if (!user_id || !password) {
    return res
      .status(400)
      .json({ success: false, message: "יש להזין מזהה וסיסמה" });
  }

  try {
    const query = `
      SELECT u.*, r.role_name, ${roleFieldsSQL}
      FROM users u
      JOIN roles_permissions r ON u.role_id = r.role_id
      WHERE u.user_id = ?
    `;
    const [users] = await db.query(query, [user_id]);
    if (users.length === 0) {
      return res.status(401).json({ success: false, message: "מזהה לא קיים" });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ success: false, message: "סיסמה שגויה" });

    // דרישת החלפת סיסמה אם עברו 90 יום
    const daysSince = user.last_password_change
      ? getDaysSince(user.last_password_change)
      : 0;
    if (daysSince >= 90) {
      const { token: resetToken, expires: resetExpireAt } =
        generateResetToken();

      const [insertReset] = await db.query(
        "INSERT INTO password_resets (user_id, reset_token, reset_expires) VALUES (?, ?, ?)",
        [user.user_id, resetToken, resetExpireAt]
      );
      if (insertReset.affectedRows !== 1) {
        return res
          .status(500)
          .json({ success: false, message: "שגיאה ביצירת טוקן" });
      }

      return res.json({ success: false, mustChangePassword: true, resetToken });
    }

    const tokenPayload = {
      user_id: user.user_id,
      role_id: user.role_id,
      full_name: `${user.first_name} ${user.last_name}`,
      data_scope_all: user.data_scope_all,
      data_scope_self: user.data_scope_self,
    };
    roleFields.forEach((f) => (tokenPayload[f] = user[f]));

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    setAuthCookie(res, token);

    await db.query("DELETE FROM active_tokens WHERE user_id = ?", [
      user.user_id,
    ]);
    const [insertActive] = await db.query(
      "INSERT INTO active_tokens (token, user_id) VALUES (?, ?)",
      [token, user.user_id]
    );
    if (insertActive.affectedRows !== 1) {
      return res
        .status(500)
        .json({ success: false, message: "שגיאה בשמירת הטוקן" });
    }

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
        data_scope_all: user.data_scope_all,
        data_scope_self: user.data_scope_self,
        ...roleFields.reduce((acc, f) => ({ ...acc, [f]: user[f] }), {}),
      },
    });
  } catch (err) {
    console.error("שגיאה בהתחברות :", err);
    return res.status(500).json({ success: false, message: "שגיאת שרת" });
  }
}

/**
 * התנתקות מהמערכת
 * מגוף הבקשה user_id מקבל: טוקן מהקוקי או
 * מחזיר: מחיקת טוקן מבסיס הנתונים וניקוי הקוקי
 */
export async function logout(req, res) {
  const token = req.cookies?.token;
  const userIdFromBody = req.body?.user_id;
  let decodedUserId = null;

  try {
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        decodedUserId = decoded?.user_id || null;
      } catch {}

      await db.query("DELETE FROM active_tokens WHERE token = ?", [token]);

      const userId = userIdFromBody || decodedUserId;
      if (userId) {
        await db.query("DELETE FROM active_tokens WHERE user_id = ?", [userId]);
        logAction("התנתקות מהמערכת", userId)(req, res, () => {});
      }
    } else if (userIdFromBody) {
      await db.query("DELETE FROM active_tokens WHERE user_id = ?", [
        userIdFromBody,
      ]);
      logAction("התנתקות מהמערכת", userIdFromBody)(req, res, () => {});
    }
  } catch (err) {
    console.error("שגיאה בהתנתקות :", err);
  }

  clearAuthCookie(res);
  return res.json({ success: true, message: "התנתקת מהמערכת" });
}

/**
 * JWT קבלת משתמש נוכחי לפי
 * מקבל: טוקן מאומת
 * מחזיר: פרטי המשתמש כפי שמקודדים בטוקן
 */
export function getCurrentUser(req, res) {
  return res.status(200).json({
    success: true,
    data: req.user || null,
  });
}

/**
 * שליחת מייל לאיפוס סיסמה
 * מגוף הבקשה { email } : מקבל
 * מחזיר: הודעת הצלחה או שגיאה
 */

export async function forgotPassword(req, res) {
  let { email } = req.body;
  if (!email)
    return res.status(400).json({ success: false, message: "יש להזין אימייל" });

  try {
    // ולידציה וניקוי אימייל
    try {
      email = validateAndSanitizeEmail(email);
    } catch (e) {
      return res.status(400).json({
        success: false,
        message: e?.message || "כתובת אימייל לא חוקית",
      });
    }

    const [users] = await db.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    if (!users.length)
      return res
        .status(404)
        .json({ success: false, message: "לא נמצא משתמש עם האימייל הזה" });

    const user = users[0];

    // יצירת טוקן ותאריך תפוגה בפורמט מוכן
    const { token: resetToken, dateExpires: resetExpireAt } =
      generateResetToken();

    // מחיקת טוקנים קודמים
    await db.query("DELETE FROM password_resets WHERE user_id = ?", [
      user.user_id,
    ]);

    // הכנסת טוקן חדש
    const [insertReset] = await db.query(
      "INSERT INTO password_resets (user_id, reset_token, reset_expires) VALUES (?, ?, ?)",
      [user.user_id, resetToken, resetExpireAt]
    );

    if (insertReset.affectedRows !== 1) {
      return res
        .status(500)
        .json({ success: false, message: "שגיאה ביצירת טוקן איפוס" });
    }

    await logAction("נשלחה בקשת איפוס סיסמה", user.user_id)(req, res, () => {});
    await sendResetPasswordEmail(email, resetToken);

    return res.json({
      success: true,
      message: "נשלח מייל לאיפוס סיסמה - תקף ל-15 דקות",
    });
  } catch (err) {
    console.error("forgotPassword:", err);
    return res.status(500).json({ success: false, message: "שגיאת שרת" });
  }
}

/**
 * איפוס סיסמה בפועל
 * מגוף הבקשה { token, password } : מקבל
 * מחזיר: סטטוס הצלחה או שגיאה
 */
export async function resetPassword(req, res) {
  console.log("📥 resetPassword body:", req.body);

  const { token, password } = req.body;
  if (!token || !password) {
    return res
      .status(400)
      .json({ success: false, message: "טוקן וסיסמה הם חובה" });
  }

  if (typeof token !== "string" || typeof password !== "string") {
    return res
      .status(400)
      .json({ success: false, message: "הטוקן והסיסמה חייבים להיות מחרוזות" });
  }

  const nowIsrael = dayjs().tz("Asia/Jerusalem").format("YYYY-MM-DD HH:mm:ss");

  try {
    const [resetRows] = await db.query(
      "SELECT * FROM password_resets WHERE reset_token = ? AND reset_expires > ? ORDER BY id DESC LIMIT 1",
      [token, nowIsrael]
    );

    if (!resetRows.length) {
      return res
        .status(400)
        .json({ success: false, message: "הטוקן לא תקף או פג תוקפו" });
    }

    const resetData = resetRows[0];
    const hashedPassword = await bcrypt.hash(password, 10);

    const [updateUser] = await db.query(
      "UPDATE users SET password = ?, last_password_change = NOW() WHERE user_id = ?",
      [hashedPassword, resetData.user_id]
    );

    if (updateUser.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "המשתמש לא נמצא לעדכון" });
    }

    await logAction("בוצע איפוס סיסמה", resetData.user_id)(req, res, () => {});
    await db.query("DELETE FROM password_resets WHERE id = ?", [resetData.id]);

    return res.json({ success: true, message: "הסיסמה שונתה בהצלחה" });
  } catch (err) {
    console.error("resetPassword error:", err);
    return res.status(500).json({ success: false, message: "שגיאת שרת" });
  }
}

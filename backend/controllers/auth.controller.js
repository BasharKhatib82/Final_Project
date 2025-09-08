// backend\controllers\auth.controller.js

import { db } from "../utils/dbSingleton.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { setAuthCookie, clearAuthCookie } from "../utils/authCookies.js";
import logAction from "../utils/logAction.js";
import { roleFields, roleFieldsSQL } from "../utils/permissions.js";
import { sendResetPasswordEmail } from "../services/email.service.js";

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
    const [usersList] = await db.query(query, [user_id]);
    if (usersList.length === 0) {
      return res.status(401).json({ success: false, message: "מזהה לא קיים" });
    }

    const user = usersList[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ success: false, message: "סיסמה שגויה" });

    // דרישת החלפת סיסמה אם עברו 90 יום
    const daysSince = user.last_password_change
      ? Math.floor(
          (Date.now() - new Date(user.last_password_change).getTime()) /
            (1000 * 60 * 60 * 24)
        )
      : 0;
    if (daysSince >= 90) {
      const resetToken = randomBytes(32).toString("hex");
      const resetExpireAt = new Date(Date.now() + 1000 * 60 * 15);
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

    // JWT יצירת טוקן
    const tokenPayload = {
      user_id: user.user_id,
      role_id: user.role_id,
      full_name: `${user.first_name} ${user.last_name}`,
    };
    roleFields.forEach((f) => (tokenPayload[f] = user[f]));

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    setAuthCookie(res, token);

    // שמירת טוקן פעיל במסד הנתונים
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

    // רישום לוג התחברות
    logAction("התחברות למערכת", user.user_id)(req, res, () => {});

    // שליחת פרטי משתמש
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
    console.error("שגיאת התחברות", err);
    return res.status(500).json({ success: false, message: "שגיאת שרת" });
  }
}

/**
 * התנתקות מהמערכת
 * מגוף הבקשה user_id  מקבל: טוקן מהקוקי או
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

      const fallbackUserId = userIdFromBody || decodedUserId;
      if (fallbackUserId) {
        await db.query("DELETE FROM active_tokens WHERE user_id = ?", [
          fallbackUserId,
        ]);
        logAction("התנתקות מהמערכת", fallbackUserId)(req, res, () => {});
      }
    } else if (userIdFromBody) {
      await db.query("DELETE FROM active_tokens WHERE user_id = ?", [
        userIdFromBody,
      ]);
      logAction("התנתקות מהמערכת", userIdFromBody)(req, res, () => {});
    }
  } catch (err) {
    console.error("שגיאה ב־logout:", err);
  }

  clearAuthCookie(res);
  return res.json({ success: true, message: "התנתקת מהמערכת" });
}

/**
 * JWT קבלת משתמש נוכחי לפי
 * (middleware) מקבל: טוקן מאומת
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
  const { email } = req.body;
  if (!email)
    return res.status(400).json({ success: false, message: "יש להזין אימייל" });

  try {
    const [usersList] = await db.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    if (!usersList.length)
      return res
        .status(404)
        .json({ success: false, message: "לא נמצא משתמש עם האימייל הזה" });

    const user = usersList[0];
    const resetToken = randomBytes(32).toString("hex");
    const resetExpireAt = new Date(Date.now() + 1000 * 60 * 15);

    const [insertReset] = await db.query(
      "INSERT INTO password_resets (user_id, reset_token, reset_expires) VALUES (?, ?, ?)",
      [user.user_id, resetToken, resetExpireAt]
    );

    if (insertReset.affectedRows !== 1) {
      return res
        .status(500)
        .json({ success: false, message: "שגיאה ביצירת טוקן איפוס" });
    }

    await sendResetPasswordEmail(email, resetToken);
    return res.json({ success: true, message: "נשלח מייל לאיפוס סיסמה" });
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
  const { token, password } = req.body;
  if (!token || !password) {
    return res
      .status(400)
      .json({ success: false, message: "טוקן וסיסמה הם חובה" });
  }

  try {
    const [resetRows] = await db.query(
      "SELECT * FROM password_resets WHERE reset_token = ? AND reset_expires > NOW() ORDER BY id DESC LIMIT 1",
      [token]
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

    await db.query("DELETE FROM password_resets WHERE id = ?", [resetData.id]);
    return res.json({ success: true, message: "הסיסמה שונתה בהצלחה" });
  } catch (err) {
    console.error("resetPassword:", err);
    return res.status(500).json({ success: false, message: "שגיאת שרת" });
  }
}

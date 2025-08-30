import { db } from "../utils/dbSingleton.js";
import express from "express";
import jwt from "jsonwebtoken";
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

router.post("/login", async (req, res) => {
  const { user_id, password } = req.body;

  try {
    const query = `
      SELECT u.*, r.role_name, ${roleFieldsSQL}
      FROM users u
      JOIN roles_permissions r ON u.role_id = r.role_id
      WHERE u.user_id = ?
    `;
    const [results] = await db.query(query, [user_id]);

    if (results.length === 0) {
      return res
        .status(401)
        .json({ success: false, message: "מזהה המשתמש לא רשום במערכת" });
    }

    const user = results[0];
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res
        .status(401)
        .json({ success: false, message: "נראה שהסיסמה שהוזנה שגויה" });
    }

    // בדיקה אם עברו 90 ימים משינוי סיסמה אחרון
    if (user.last_password_change) {
      const daysSince = Math.floor(
        (Date.now() - new Date(user.last_password_change).getTime()) /
          (1000 * 60 * 60 * 24)
      );

      if (daysSince >= 90) {
        const resetToken = randomBytes(32).toString("hex");
        const expire = new Date(Date.now() + 1000 * 60 * 15);

        await db.query(
          "INSERT INTO password_resets (user_id, reset_token, reset_expires) VALUES (?, ?, ?)",
          [user.user_id, resetToken, expire]
        );

        return res.json({
          success: false,
          mustChangePassword: true,
          resetToken,
          message: "עברו 90 יום מאז שינוי הסיסמה. יש להגדיר סיסמה חדשה.",
        });
      }
    }

    // לטוקן כולל כל ההרשאות Payload יצירת
    const tokenPayload = {
      user_id: user.user_id,
      role_id: user.role_id,
      full_name: `${user.first_name} ${user.last_name}`,
    };
    roleFields.forEach((f) => {
      tokenPayload[f] = user[f];
    });

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    // ✅ שימוש בפונקציית עזר ליצירת קוקי מאובטח
    setAuthCookie(res, token);

    await db.query("DELETE FROM active_tokens WHERE user_id = ?", [
      user.user_id,
    ]);
    await db.query("INSERT INTO active_tokens (token, user_id) VALUES (?, ?)", [
      token,
      user.user_id,
    ]);

    logAction("התחברות למערכת", user.user_id)(req, res, () => {});

    res.json({
      success: true,
      user: {
        user_id: user.user_id,
        role_id: user.role_id,
        first_name: user.first_name,
        last_name: user.last_name,
        role_name: user.role_name,
        ...roleFields.reduce((acc, f) => ({ ...acc, [f]: user[f] }), {}),
      },
    });
  } catch (err) {
    console.error("שגיאה כללית בהתחברות:", err);
    res.status(500).json({ success: false, message: "שגיאה בשרת" });
  }
});

// ********************************************** /
//      בדיקת התחברות
// ********************************************** /

router.get("/check", async (req, res) => {
  const token = req.cookies?.token;

  if (!token) {
    return res.json({ loggedIn: false });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // active_tokens נבדוק אם הטוקן קיים בטבלה
    const [rows] = await db.query(
      "SELECT 1 FROM active_tokens WHERE token = ? AND user_id = ?",
      [token, decoded.user_id]
    );

    if (rows.length === 0) {
      return res.json({ loggedIn: false });
    }

    //  אם הכל תקין
    return res.json({
      loggedIn: true,
      user: decoded,
    });
  } catch (err) {
    console.error("Auth check error:", err);
    return res.json({ loggedIn: false });
  }
});

// ********************************************** /
//      התנתקות מהמערכת
// ********************************************** /

// 🔑 logout
router.post("/logout", async (req, res) => {
  const token = req.cookies?.token;
  const userIdFromBody = req.body?.user_id;

  try {
    if (token) {
      // אם יש טוקן בקוקי — מוחקים לפי טוקן
      await db.query("DELETE FROM active_tokens WHERE token = ?", [token]);

      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded?.user_id) {
          logAction("התנתקות מהמערכת", decoded.user_id)(req, res, () => {});
        }
      } catch {
        // userIdFromBody הטוקן פג תוקף ־  אם יש
        if (userIdFromBody) {
          await db.query("DELETE FROM active_tokens WHERE user_id = ?", [
            userIdFromBody,
          ]);
          logAction("התנתקות מהמערכת", userIdFromBody)(req, res, () => {});
        }
      }
    } else if (userIdFromBody) {
      //user_id אם אין טוקן בכלל (כבר נמחק ע"י הדפדפן) — מוחקים לפי 
      await db.query("DELETE FROM active_tokens WHERE user_id = ?", [
        userIdFromBody,
      ]);
      logAction("התנתקות מהמערכת", userIdFromBody)(req, res, () => {});
    }
  } catch (err) {
    console.error("❌ שגיאה במחיקת טוקן:", err);
  }

  clearAuthCookie(res); // ✅ מנקה את הקוקי בכל מקרה
  res.json({ success: true, message: "התנתקת מהמערכת" });
});


// ********************************************** /
//      איפוס סיסמה - שליחת מייל עם טוקן
// ********************************************** /

router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  try {
    const [user] = await db.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    if (!user.length) {
      return res.status(404).json({ message: "לא נמצא משתמש עם האימייל הזה" });
    }

    const resetToken = randomBytes(32).toString("hex");
    const expire = new Date(Date.now() + 1000 * 60 * 15);

    await db.query(
      "INSERT INTO password_resets (user_id, reset_token, reset_expires) VALUES (?, ?, ?)",
      [user[0].user_id, resetToken, expire]
    );

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
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

    res.json({ message: "נשלח מייל עם לינק לאיפוס סיסמה" });
  } catch (err) {
    console.error("❌ שגיאת איפוס:", err);
    res.status(500).json({ message: "שגיאת שרת" });
  }
});

// ********************************************** /
//      איפוס סיסמה בפועל
// ********************************************** /

router.post("/reset-password", async (req, res) => {
  const { token, password } = req.body;
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

    await db.query(
      "UPDATE users SET password = ? ,last_password_change = NOW() WHERE user_id = ?",
      [hashedPassword, resetData.user_id]
    );

    await db.query("DELETE FROM password_resets WHERE id = ?", [resetData.id]);

    res.json({ success: true, message: "הסיסמה שונתה בהצלחה" });
  } catch (err) {
    console.error("❌ שגיאת Reset:", err);
    res.status(500).json({ success: false, message: "שגיאת שרת" });
  }
});

export default router;

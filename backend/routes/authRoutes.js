// קובץ: routes/authRoutes.js

// ✅ ייבוא הקוד המקצועי של ה-DB מהקובץ dbSingleton.js
import { db } from "../utils/dbSingleton.js";
import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import nodemailer from "nodemailer";
import verifyToken from "../utils/verifyToken.js";
import logAction from "../utils/logAction.js";

const router = express.Router();

// **************************** /
//        התחברות משתמש        /
// **************************** /
router.post("/login", async (req, res) => {
  const { user_id, password } = req.body;

  try {
    // ✅ שינוי מרכזי: שימוש ב-async/await וב-db.query
    // זה מבטיח שהחיבור מנוהל על ידי ה-pool ומונע שגיאות ECONNRESET
    const query = `
      SELECT u.*, 
            r.role_name,
            r.role_management,
            r.can_manage_users, 
            r.can_view_reports, 
            r.can_assign_leads, 
            r.can_edit_courses, 
            r.can_manage_tasks, 
            r.can_access_all_data
      FROM users u
      JOIN roles_permissions r ON u.role_id = r.role_id
      WHERE u.user_id = ?
    `;
    const [results] = await db.query(query, [user_id]);

    if (results.length === 0) {
      return res.status(401).json({ success: false, message: "משתמש לא נמצא" });
    }

    const user = results[0];

    bcrypt.compare(password, user.password).then((res) => {
      console.log("match?", res);
    });

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(401).json({ success: false, message: "סיסמה שגויה" });
    }

    // בדיקה אם עברו 90 ימים משינוי סיסמה אחרון
    if (user.last_password_change) {
      const daysSince = Math.floor(
        (Date.now() - new Date(user.last_password_change).getTime()) /
          (1000 * 60 * 60 * 24)
      );

      if (daysSince >= 90) {
        const resetToken = randomBytes(32).toString("hex");
        const expire = new Date(Date.now() + 1000 * 60 * 5); // 5 דקות

        await db.query(
          "INSERT INTO password_resets (user_id, reset_token, reset_expires) VALUES (?, ?, ?)",
          [user.user_id, resetToken, expire]
        );
        return res.json({
          success: false,
          mustChangePassword: true, //
          message: "עברו 90 יום מאז שינוי הסיסמה. יש להגדיר סיסמה חדשה.",
        });
      }
    }

    // יצירת טוקן — כולל ההרשאות !
    const token = jwt.sign(
      {
        user_id: user.user_id,
        role_id: user.role_id,
        full_name: `${user.first_name} ${user.last_name}`,
        role_management: user.role_management,
        can_manage_users: user.can_manage_users,
        can_view_reports: user.can_view_reports,
        can_assign_leads: user.can_assign_leads,
        can_edit_courses: user.can_edit_courses,
        can_manage_tasks: user.can_manage_tasks,
        can_access_all_data: user.can_access_all_data,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // שמירת הטוקן כ-Cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 1000 * 60 * 60,
      domain: ".respondify-crm.co.il",
    });

    // ✅ שינוי: מחיקת טוקן קודם ושמירת טוקן חדש באמצעות async/await
    // שימוש בשאילתות נפרדות מבטיח עקביות
    await db.query("DELETE FROM active_tokens WHERE user_id = ?", [
      user.user_id,
    ]);
    await db.query("INSERT INTO active_tokens (token, user_id) VALUES (?, ?)", [
      token,
      user.user_id,
    ]);

    // רישום פעולה ליומן
    logAction("התחברות למערכת", user.user_id)(req, res, () => {});

    // תגובה ללקוח
    res.json({
      success: true,
      user: {
        user_id: user.user_id,
        role_id: user.role_id,
        first_name: user.first_name,
        last_name: user.last_name,
        role_name: user.role_name,
        role_management: user.role_management,
        can_manage_users: user.can_manage_users,
        can_view_reports: user.can_view_reports,
        can_assign_leads: user.can_assign_leads,
        can_edit_courses: user.can_edit_courses,
        can_manage_tasks: user.can_manage_tasks,
        can_access_all_data: user.can_access_all_data,
      },
    });
  } catch (err) {
    console.error("שגיאה כללית בהתחברות:", err);
    res.status(500).json({ success: false, message: "שגיאה בשרת" });
  }
});

// ********************************************** /
//      Promise - בדיקת התחברות - שימוש ב       /
// ********************************************** /
// בדיקת התחברות - מחזיר תמיד 200
router.get("/check", (req, res) => {
  const token = req.cookies?.token;

  if (!token) {
    return res.json({ loggedIn: false });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.json({ loggedIn: false });
    }

    res.json({
      loggedIn: true,
      user: decoded,
    });
  });
});

// ✅ התנתקות - קוד מתוקן ומקצועי
router.post("/logout", async (req, res) => {
  const token = req.cookies?.token;

  if (token) {
    try {
      // ✅ שינוי: מחיקת הטוקן מהמסד באמצעות async/await
      await db.query("DELETE FROM active_tokens WHERE token = ?", [token]);

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded?.user_id) {
        logAction("התנתקות מהמערכת", decoded.user_id)(req, res, () => {});
      }
    } catch (err) {
      console.error("שגיאה במחיקת טוקן או בפענוח:", err);
    }
  }

  res.clearCookie("token");
  res.json({ success: true, message: "התנתקת מהמערכת" });
});

// ✅ איפוס סיסמה - שליחת מייל עם טוקן
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  try {
    // מחפשים את המשתמש
    const [user] = await db.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    if (!user.length) {
      return res.status(404).json({ message: "לא נמצא משתמש עם האימייל הזה" });
    }

    const resetToken = randomBytes(32).toString("hex");
    const expire = new Date(Date.now() + 1000 * 60 * 15); // 15 דקות

    // שומרים את הטוקן בטבלת password_resets (לא בתוך users!)
    await db.query(
      "INSERT INTO password_resets (user_id, reset_token, reset_expires) VALUES (?, ?, ?)",
      [user[0].user_id, resetToken, expire]
    );

    // שולחים מייל עם לינק
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST, // mail.respondify-crm.co.il
      port: process.env.SMTP_PORT, // 465
      secure: process.env.SMTP_SECURE === "true", // true
      auth: {
        user: process.env.SMTP_USER, // reports@respondify-crm.co.il
        pass: process.env.SMTP_PASS, // ********
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

// ✅ איפוס סיסמה בפועל
router.post("/reset-password", async (req, res) => {
  const { token, password } = req.body;
  try {
    // מאתרים את הטוקן האחרון שעדיין בתוקף
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

    // מצפינים סיסמה חדשה עם bcryptjs
    const hashedPassword = await bcrypt.hash(password, 10);

    // עדכון סיסמה בטבלת users
    await db.query(
      "UPDATE users SET password = ? ,last_password_change = NOW() WHERE user_id = ?",
      [hashedPassword, resetData.user_id]
    );

    // מוחקים את רשומת האיפוס (שימוש חד פעמי)
    await db.query("DELETE FROM password_resets WHERE id = ?", [resetData.id]);

    res.json({ success: true, message: "הסיסמה שונתה בהצלחה" });
  } catch (err) {
    console.error("❌ שגיאת Reset:", err);
    res.status(500).json({ success: false, message: "שגיאת שרת" });
  }
});

export default router;

// קובץ: routes/authRoutes.js

// ✅ ייבוא הקוד המקצועי של ה-DB מהקובץ dbSingleton.js
import { db } from "../utils/dbSingleton.js";
import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import verifyToken from "../utils/verifyToken.js";
import logAction from "../utils/logAction.js";

const router = express.Router();

// ✅ התחברות משתמש - קוד מתוקן ומקצועי
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
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60, // שעה
      sameSite: "Lax",
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

// ✅ בדיקת התחברות - שינוי קל לשימוש ב-Promise
router.get("/check", verifyToken, (req, res) => {
  res.json({
    loggedIn: true,
    user: req.user,
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

    const resetToken = crypto.randomBytes(32).toString("hex");
    const expire = new Date(Date.now() + 1000 * 60 * 15); // 15 דקות

    await db.query(
      "UPDATE users SET reset_token = ?, reset_expires = ? WHERE email = ?",
      [resetToken, expire, email]
    );

    // שולחים מייל עם לינק
    const transporter = nodemailer.createTransport({
      service: "Gmail",
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
    console.error("שגיאת איפוס:", err);
    res.status(500).json({ message: "שגיאת שרת" });
  }
});

router.post("/reset-password", async (req, res) => {
  const { token, password } = req.body;
  try {
    const [user] = await db.query(
      "SELECT * FROM users WHERE reset_token = ? AND reset_expires > NOW()",
      [token]
    );

    if (!user.length) {
      return res
        .status(400)
        .json({ success: false, message: "הטוקן לא תקף או פג תוקפו" });
    }

    const hashed = crypto.createHash("sha256").update(password).digest("hex");

    await db.query(
      "UPDATE users SET password = ?, reset_token = NULL, reset_expires = NULL WHERE user_id = ?",
      [hashed, user[0].user_id]
    );

    res.json({ success: true, message: "הסיסמה שונתה בהצלחה" });
  } catch (err) {
    console.error("שגיאת Reset:", err);
    res.status(500).json({ success: false, message: "שגיאת שרת" });
  }
});

export default router;

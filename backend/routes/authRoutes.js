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

export default router;

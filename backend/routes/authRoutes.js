import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import verifyToken from "../utils/verifyToken.js";
import logAction from "../utils/logAction.js";
import dbSingleton from "../utils/dbSingleton.js";

const router = express.Router();
const connection = dbSingleton.getConnection();

// ✅ התחברות משתמש
router.post("/login", async (req, res) => {
  const { user_id, password } = req.body;

  try {
    connection.query(
      `
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
    `,
      [user_id],
      async (err, results) => {
        if (err)
          return res
            .status(500)
            .json({ success: false, message: "שגיאה בשרת" });

        if (results.length === 0) {
          return res
            .status(401)
            .json({ success: false, message: "משתמש לא נמצא" });
        }

        const user = results[0];
        const match = await bcrypt.compare(password, user.password);

        if (!match) {
          return res
            .status(401)
            .json({ success: false, message: "סיסמה שגויה" });
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

        // שמירת הטוקן
        res.cookie("token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          maxAge: 1000 * 60 * 60,
          sameSite: "Lax",
        });

        // מחיקת טוקן קודם (אם יש)
        connection.query(
          "DELETE FROM active_tokens WHERE user_id = ?",
          [user.user_id],
          (delErr) => {
            if (delErr) console.error("שגיאה במחיקת טוקן קודם:", delErr);

            //  שמירת הטוקן החדש במסד הנתונים
            connection.query(
              "INSERT INTO active_tokens (token, user_id) VALUES (?, ?)",
              [token, user.user_id],
              (insertErr) => {
                if (insertErr) {
                  console.error("שגיאה בשמירת הטוקן למסד:", insertErr);
                  return res
                    .status(500)
                    .json({ success: false, message: "שגיאה בשרת" });
                }

                // ✅ מפורש user_id רישום פעולה ליומן עם
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
              }
            );
          }
        );
      }
    );
  } catch (err) {
    console.error("שגיאה כללית בהתחברות:", err);
    res.status(500).json({ success: false, message: "שגיאה בשרת" });
  }
});

// ✅ בדיקת התחברות
router.get("/check", verifyToken, (req, res) => {
  res.json({
    loggedIn: true,
    user: req.user,
  });
});

// ✅ התנתקות
router.post("/logout", (req, res) => {
  const token = req.cookies?.token;

  if (token) {
    connection.query(
      "DELETE FROM active_tokens WHERE token = ?",
      [token],
      (err) => {
        if (err) {
          console.error("שגיאה במחיקת טוקן ממסד:", err);
        }
      }
    );

    try {
      // שליפת מזהה משתמש מהטוקן
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded?.user_id) {
        logAction("התנתקות מהמערכת", decoded.user_id)(req, res, () => {});
      }
    } catch (err) {
      console.warn("שגיאה בפענוח טוקן בעת התנתקות:", err.message);
    }
  }

  res.clearCookie("token");
  res.json({ success: true, message: "התנתקת מהמערכת" });
});

export default router;

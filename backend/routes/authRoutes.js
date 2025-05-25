import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
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
      "SELECT * FROM users WHERE user_id = ?",
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

        const token = jwt.sign(
          {
            user_id: user.user_id,
            role_id: user.role_id,
            full_name: `${user.first_name} ${user.last_name}`,
          },
          process.env.JWT_SECRET,
          { expiresIn: "1h" }
        );

        res.cookie("token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          maxAge: 1000 * 60 * 60,
          sameSite: "Lax",
        });

        // 🧼 מחיקת טוקן קודם של המשתמש
        connection.query(
          "DELETE FROM active_tokens WHERE user_id = ?",
          [user.user_id],
          (delErr) => {
            if (delErr) console.error("שגיאה במחיקת טוקן קודם:", delErr);

            // ✍️ הכנסת טוקן חדש
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

                res.json({
                  success: true,
                  user: {
                    role_id: user.role_id,
                    first_name: user.first_name,
                    last_name: user.last_name,
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
  }

  res.clearCookie("token");
  res.json({ success: true, message: "התנתקת מהמערכת" });
});

export default router;

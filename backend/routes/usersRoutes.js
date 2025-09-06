import express from "express";
import bcrypt from "bcryptjs";
import { db } from "../utils/dbSingleton.js";
import logAction from "../utils/logAction.js";
import verifyToken from "../utils/verifyToken.js";

const router = express.Router();

/* ============================
        הוספת משתמש חדש
   ============================ */
router.post("/add", verifyToken, async (req, res) => {
  const {
    user_id,
    first_name,
    last_name,
    phone_number,
    email,
    role_id,
    password,
    notes,
  } = req.body;

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

  try {
    const hash = await bcrypt.hash(password, 10);

    const sql = `
      INSERT INTO users 
      (user_id, first_name, last_name, phone_number, email, role_id, password, last_password_change, notes, active) 
      VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), ?, 1)
    `;

    await db.query(sql, [
      user_id,
      first_name,
      last_name,
      phone_number,
      email,
      role_id,
      hash,
      notes,
    ]);

    logAction("הוספת משתמש חדש")(req, res, () => {});
    res.json({ success: true, message: "המשתמש נוסף בהצלחה" });
  } catch (err) {
    console.error("❌ שגיאה בהוספת משתמש:", err);

    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        success: false,
        message: "❌ המשתמש כבר קיים במערכת (ת.ז כפולה)",
      });
    }

    res.status(500).json({ success: false, message: "שגיאת שרת" });
  }
});

/* ===========================================
      עדכון משתמש ( לא כולל מנהל כללי )
   =========================================== */
router.put("/:id", verifyToken, async (req, res) => {
  const { id } = req.params;

  if (parseInt(id, 10) === 1) {
    return res.status(403).json({
      success: false,
      message: "עריכת פרטי מנהל כללי חסומה",
    });
  }

  const { first_name, last_name, phone_number, email, role_id, notes, active } =
    req.body;

  if (!first_name || !last_name || !email || !role_id) {
    return res.status(400).json({ success: false, message: "שדות חובה חסרים" });
  }

  try {
    const sql = `
      UPDATE users SET
        first_name = ?, last_name = ?, phone_number = ?, email = ?,
        role_id = ?, notes = ?, active = ?
      WHERE user_id = ?
    `;

    const [result] = await db.query(sql, [
      first_name,
      last_name,
      phone_number || null,
      email,
      role_id,
      notes || null,
      active,
      id,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "משתמש לא נמצא" });
    }

    logAction(`עדכון משתמש #${id}`)(req, res, () => {});
    res.json({ success: true, message: "המשתמש עודכן בהצלחה" });
  } catch (err) {
    console.error("❌ שגיאה בעדכון משתמש:", err);
    res.status(500).json({ success: false, message: "שגיאת שרת" });
  }
});

/* ===========================================
      מחיקה לוגית ( לא כולל מנהל כללי )
   =========================================== */
router.put("/delete/:id", verifyToken, async (req, res) => {
  const { id } = req.params;

  if (parseInt(id, 10) === 1) {
    return res.status(403).json({
      success: false,
      message: "מחיקת מנהל כללי חסומה",
    });
  }

  try {
    const [result] = await db.query(
      "UPDATE users SET active = 0 WHERE user_id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "משתמש לא נמצא" });
    }

    logAction(`השבתת משתמש #${id}`)(req, res, () => {});
    res.json({ success: true, message: "המשתמש הושבת בהצלחה" });
  } catch (err) {
    console.error("❌ שגיאה בהשבתת משתמש:", err);
    res.status(500).json({ success: false, message: "שגיאת שרת" });
  }
});

/* ===========================================
      שליפת משתמשים פעילים כולל שם תפקיד
   =========================================== */
router.get("/active", verifyToken, async (req, res) => {
  try {
    const [usersList] = await db.query(
      `SELECT u.user_id,
              u.first_name,
              u.last_name,
              u.phone_number,
              u.email,
              u.role_id,
              r.role_name,           
              u.notes,
              u.active
       FROM users u
       LEFT JOIN roles_permissions r ON u.role_id = r.role_id
       WHERE u.active = 1`
    );
    res.json({ success: true, data: usersList });
  } catch (err) {
    console.error("❌ שגיאה בשליפת משתמשים פעילים:", err);
    res.status(500).json({ success: false, message: "שגיאת שרת" });
  }
});

/* ================================================
      שליפת משתמשים לא פעילים כולל שם תפקיד
   ================================================ */
router.get("/inactive", verifyToken, async (req, res) => {
  try {
    const [usersList] = await db.query(
      `SELECT u.user_id,
              u.first_name,
              u.last_name,
              u.phone_number,
              u.email,
              u.role_id,
              r.role_name,          
              u.notes,
              u.active
       FROM users u
       LEFT JOIN roles_permissions r ON u.role_id = r.role_id
       WHERE u.active = 0`
    );
    res.json({ success: true, data: usersList });
  } catch (err) {
    console.error("❌ שגיאה בשליפת משתמשים לא פעילים:", err);
    res.status(500).json({ success: false, message: "שגיאת שרת" });
  }
});

/* ========================================
      שליפת משתמש בודד לפי מזהה 
   ======================================== */
router.get("/:id", verifyToken, async (req, res) => {
  const { id } = req.params;

  try {
    const [user] = await db.query(
      `SELECT u.user_id,
              u.first_name,
              u.last_name,
              u.phone_number,
              u.email,
              u.role_id,
              r.role_name,           
              u.notes,
              u.active
       FROM users u
       LEFT JOIN roles_permissions r ON u.role_id = r.role_id
       WHERE u.user_id = ?`,
      [id]
    );

    if (results.length === 0) {
      return res.status(404).json({ success: false, message: "משתמש לא נמצא" });
    }

    res.json({ success: true, data: user[0] });
  } catch (err) {
    console.error("❌ שגיאה בשליפת משתמש:", err);
    res.status(500).json({ success: false, message: "שגיאת שרת" });
  }
});

/* ==========================
      שינוי סיסמה למשתמש
   ========================== */
router.put("/change-password/:id", verifyToken, async (req, res) => {
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

    const hashedPassword = rows[0].password;

    const isMatch = await bcrypt.compare(currentPassword, hashedPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "סיסמה נוכחית שגויה",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const newHashedPassword = await bcrypt.hash(newPassword, salt);

    await db.query(
      "UPDATE users SET password = ?, last_password_change = NOW() WHERE user_id = ?",
      [newHashedPassword, id]
    );

    logAction(`שינוי סיסמה למשתמש #${id}`)(req, res, () => {});
    res.json({ success: true, message: "הסיסמה עודכנה בהצלחה" });
  } catch (err) {
    console.error("❌ שגיאה בשינוי סיסמה:", err);
    res.status(500).json({ success: false, message: "שגיאת שרת בשינוי סיסמה" });
  }
});

export default router;

import express from "express";
import path from "path";
import fs from "fs/promises";
import multer from "multer";
import bcrypt from "bcryptjs";
import { db } from "../utils/dbSingleton.js";
import logAction from "../utils/logAction.js";
import verifyToken from "../utils/verifyToken.js";

const router = express.Router();

const LOGO_UPLOAD_DIR = "./uploads/logos";
const BUSINESS_JSON = "./data/business.json";

// === Multer config ===
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      await fs.mkdir(LOGO_UPLOAD_DIR, { recursive: true });
      cb(null, LOGO_UPLOAD_DIR);
    } catch (err) {
      cb(err, null);
    }
  },
  filename: (req, file, cb) => {
    const uniqueName = "logo_" + Date.now() + path.extname(file.originalname);
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

/* ============================
   פרטי עסק (Business Info)
   ============================ */

// שליפת פרטי עסק
router.get("/business", verifyToken, async (req, res) => {
  try {
    const data = await fs.readFile(BUSINESS_JSON, "utf-8");
    res.json({ success: true, data: JSON.parse(data) });
  } catch (err) {
    console.error("❌ שגיאה בשליפת נתוני עסק:", err);
    res.status(500).json({ success: false, message: "שגיאה בשליפת נתוני עסק" });
  }
});

// עדכון פרטי עסק כולל לוגו
router.put(
  "/business",
  verifyToken,
  upload.single("logo"),
  async (req, res) => {
    try {
      let data = JSON.parse(await fs.readFile(BUSINESS_JSON, "utf-8"));

      data.business_name = req.body.business_name || data.business_name;
      data.address = req.body.address || data.address;
      data.phone = req.body.phone || data.phone;

      if (req.file) {
        if (data.logo && data.logo !== "/uploads/logos/default.png") {
          const oldPath = "." + data.logo;
          if (oldPath.startsWith("./uploads/logos")) {
            try {
              await fs.unlink(oldPath);
            } catch (e) {
              console.warn("⚠️ לא ניתן למחוק לוגו קודם:", e.message);
            }
          }
        }
        data.logo = "/uploads/logos/" + req.file.filename;
      }

      await fs.writeFile(BUSINESS_JSON, JSON.stringify(data, null, 2));
      logAction("עדכון פרטי עסק")(req, res, () => {});
      res.json({ success: true, data, message: "עודכן בהצלחה" });
    } catch (err) {
      console.error("❌ שגיאה בעדכון עסק:", err);
      res.status(500).json({ success: false, message: "שגיאה בעדכון נתונים" });
    }
  }
);

/* ============================
   ניהול משתמשים
   ============================ */

// הוספת משתמש חדש
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

  if (!first_name || !last_name || !email || !role_id || !password) {
    return res.status(400).json({ success: false, message: "שדות חובה חסרים" });
  }

  try {
    const hash = await bcrypt.hash(password, 10);
    const sql = `
      INSERT INTO users 
      (user_id, first_name, last_name, phone_number, email, role_id, password, last_password_change, notes, active) 
      VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?)
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
      1,
    ]);

    logAction("הוספת משתמש חדש")(req, res, () => {});
    res.json({ success: true, message: "המשתמש נוסף בהצלחה" });
  } catch (err) {
    console.error("❌ שגיאה בהוספת משתמש:", err);

    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        success: false,
        message: "האימייל או הטלפון כבר קיימים במערכת",
      });
    }

    res.status(500).json({ success: false, message: "שגיאת שרת" });
  }
});

// עדכון משתמש
router.put("/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
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

// מחיקה לוגית (השבתה)
router.put("/delete/:id", verifyToken, async (req, res) => {
  const { id } = req.params;

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

// שליפת משתמשים פעילים עם שם תפקיד
router.get("/active", verifyToken, async (req, res) => {
  try {
    const [results] = await db.query(
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
       LEFT JOIN roles r ON u.role_id = r.role_id
       WHERE u.active = 1`
    );
    res.json({ success: true, Result: results });
  } catch (err) {
    console.error("❌ שגיאה בשליפת משתמשים פעילים:", err);
    res.status(500).json({ success: false, message: "שגיאת שרת" });
  }
});

// שליפת משתמשים לא פעילים עם שם תפקיד
router.get("/inactive", verifyToken, async (req, res) => {
  try {
    const [results] = await db.query(
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
       LEFT JOIN roles r ON u.role_id = r.role_id
       WHERE u.active = 0`
    );
    res.json({ success: true, Result: results });
  } catch (err) {
    console.error("❌ שגיאה בשליפת משתמשים לא פעילים:", err);
    res.status(500).json({ success: false, message: "שגיאת שרת" });
  }
});

// שליפת משתמש בודד לפי מזהה עם שם תפקיד
router.get("/:id", verifyToken, async (req, res) => {
  const { id } = req.params;

  try {
    const [results] = await db.query(
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
       LEFT JOIN roles r ON u.role_id = r.role_id
       WHERE u.user_id = ?`,
      [id]
    );

    if (results.length === 0) {
      return res.status(404).json({ success: false, message: "משתמש לא נמצא" });
    }

    res.json({ success: true, data: results[0] });
  } catch (err) {
    console.error("❌ שגיאה בשליפת משתמש:", err);
    res.status(500).json({ success: false, message: "שגיאת שרת" });
  }
});

export default router;

import express from "express";
import path from "path";
import fs from "fs/promises";
import multer from "multer";
import { db } from "../utils/dbSingleton.js";
import logAction from "../utils/logAction.js";
import verifyToken from "../utils/verifyToken.js";
import bcrypt from "bcryptjs";

const router = express.Router();

const LOGO_UPLOAD_DIR = "./uploads/logos";
const BUSINESS_JSON = "./data/business.json";

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

// === הוספת משתמש חדש ===
router.post("/add", verifyToken, async (req, res) => {
  const sql = `
    INSERT INTO users 
    (user_id, first_name, last_name, phone_number, email, role_id, password, last_password_change, notes, is_active) 
    VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?)
  `;

  try {
    const hash = await bcrypt.hash(req.body.password, 10);
    const values = [
      req.body.user_id,
      req.body.first_name,
      req.body.last_name,
      req.body.phone_number,
      req.body.email,
      req.body.role_id,
      hash,
      req.body.notes,
      1,
    ];
    await db.query(sql, values);
    await logAction("הוספת משתמש חדש", req.user?.user_id);
    return res.json({ Status: true, Message: "המשתמש נוסף בהצלחה" });
  } catch (err) {
    console.error("שגיאה בהוספת משתמש:", err.message);
    return res.json({ Status: false, Error: "שגיאה בהוספת המשתמש למערכת" });
  }
});

// === עדכון משתמש לפי מזהה ===
router.put("/:id", verifyToken, async (req, res) => {
  const userId = req.params.id;
  const {
    first_name,
    last_name,
    phone_number,
    email,
    role_id,
    notes,
    is_active,
  } = req.body;

  if (!first_name || !last_name || !email || !role_id) {
    return res
      .status(400)
      .json({ Status: false, Error: "Missing required fields" });
  }

  const updateQuery = `
    UPDATE users SET
    first_name = ?,
    last_name = ?,
    phone_number = ?,
    email = ?,
    role_id = ?,
    notes = ?,
    is_active = ?
    WHERE user_id = ?
  `;

  const values = [
    first_name,
    last_name,
    phone_number || null,
    email,
    role_id,
    notes || null,
    is_active,
    userId,
  ];

  try {
    await db.query(updateQuery, values);
    return res
      .status(200)
      .json({ Status: true, Message: "המשתמש עודכן בהצלחה" });
  } catch (err) {
    console.error("שגיאה בעדכון משתמש:", err);
    return res.status(500).json({ Status: false, Error: "Database Error" });
  }
});

// === שליפת עובדים פעילים ===
router.get("/active", verifyToken, async (req, res) => {
  const query = "SELECT * FROM users WHERE is_active = 1";
  try {
    const [results] = await db.query(query);
    res.status(200).json({ Status: true, Result: results });
  } catch (err) {
    console.error("שגיאה בשליפת עובדים פעילים:", err);
    return res.status(500).json({ Status: false, Error: "שגיאה במסד" });
  }
});

// === שליפת עובדים לא פעילים ===
router.get("/inactive", verifyToken, async (req, res) => {
  const query = "SELECT * FROM users WHERE is_active = 0";
  try {
    const [results] = await db.query(query);
    res.status(200).json({ Status: true, Result: results });
  } catch (err) {
    console.error("שגיאה בשליפת עובדים לא פעילים:", err);
    return res.status(500).json({ Status: false, Error: "שגיאה במסד" });
  }
});

// === שליפת משתמש בודד לפי מזהה ===
router.get("/:id", verifyToken, async (req, res) => {
  const userId = req.params.id;

  const query = "SELECT * FROM users WHERE user_id = ?";
  try {
    const [results] = await db.query(query, [userId]);
    if (results.length === 0) {
      return res.status(404).json({ Status: false, Error: "המשתמש לא נמצא" });
    }
    res.status(200).json({ Status: true, User: results[0] });
  } catch (err) {
    console.error("שגיאה בשליפת משתמש בודד:", err);
    return res.status(500).json({ Status: false, Error: "Database Error" });
  }
});

// === שליפת פרטי עסק ===
router.get("/business", verifyToken, async (req, res) => {
  try {
    const data = await fs.readFile(BUSINESS_JSON, "utf-8");
    const businessData = JSON.parse(data);
    res.json({ Business: businessData });
  } catch (err) {
    console.error("שגיאה בשליפת נתוני עסק:", err);
    res.status(500).json({ error: "שגיאה בשליפת נתוני עסק" });
  }
});

// === עדכון פרטי עסק כולל לוגו ===
router.put(
  "/business",
  verifyToken,
  upload.single("logo"),
  async (req, res) => {
    try {
      let data = JSON.parse(await fs.readFile(BUSINESS_JSON, "utf-8"));
      data.business_name = req.body.business_name;
      data.address = req.body.address;
      data.phone = req.body.phone;

      if (req.file) {
        if (data.logo && data.logo !== "/uploads/logos/default.png") {
          const oldPath = "." + data.logo;
          try {
            await fs.unlink(oldPath);
          } catch (unlinkErr) {
            console.warn("Could not delete old logo file:", unlinkErr);
          }
        }
        data.logo = "/uploads/logos/" + req.file.filename;
      }

      await fs.writeFile(BUSINESS_JSON, JSON.stringify(data, null, 2));
      res.json({ message: "עודכן בהצלחה", logo: data.logo });
    } catch (err) {
      console.error("שגיאה בעדכון פרטי עסק:", err);
      res.status(500).json({ error: "שגיאה בעדכון נתונים" });
    }
  }
);

// === מחיקה לוגית של משתמש (השבתה) ===
router.put("/delete/:id", verifyToken, async (req, res) => {
  const userId = req.params.id;

  const query = `
    UPDATE users SET is_active = 0
    WHERE user_id = ?
  `;

  try {
    await db.query(query, [userId]);
    await logAction("השבתת משתמש", req.user?.user_id);
    res.status(200).json({ Status: true, Message: "המשתמש הושבת בהצלחה" });
  } catch (err) {
    console.error("שגיאה בהשבתת משתמש:", err);
    return res.status(500).json({ Status: false, Error: "Database Error" });
  }
});

export default router;

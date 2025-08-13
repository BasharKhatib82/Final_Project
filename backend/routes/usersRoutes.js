import express from "express";
import path from "path";
import fs from "fs";
import multer from "multer";
import dbSingleton from "../utils/dbSingleton.js";
import logAction from "../utils/logAction.js";
import verifyToken from "../utils/verifyToken.js";
import bcrypt from "bcrypt";

const connection = dbSingleton.getConnection();
const router = express.Router();

const LOGO_UPLOAD_DIR = "./uploads/logos";
const BUSINESS_JSON = "./data/business.json";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync(LOGO_UPLOAD_DIR)) {
      fs.mkdirSync(LOGO_UPLOAD_DIR, { recursive: true });
    }
    cb(null, LOGO_UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueName = "logo_" + Date.now() + path.extname(file.originalname);
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

// === הוספת משתמש חדש ===
router.post("/add", verifyToken, (req, res) => {
  const sql = `
    INSERT INTO users 
    (user_id, first_name, last_name, phone_number, email, role_id, password, last_password_change, notes, is_active) 
    VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?)
  `;

  bcrypt.hash(req.body.password, 10, (err, hash) => {
    if (err) {
      console.error("Hashing error:", err);
      return res.json({ Status: false, Error: "Hashing Error" });
    }

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

    connection.query(sql, values, (err, result) => {
      if (err) {
        console.error("שגיאה בהוספת משתמש:", err.message);
        return res.json({ Status: false, Error: "שגיאה בהוספת המשתמש למערכת" });
      }
      logAction("הוספת משתמש חדש", req.user?.user_id)(req, res, () => {});
      return res.json({ Status: true, Result: result });
    });
  });
});

// === עדכון משתמש לפי מזהה ===
router.put("/:id", verifyToken, (req, res) => {
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

  connection.query(updateQuery, values, (err, result) => {
    if (err)
      return res.status(500).json({ Status: false, Error: "Database Error" });

    return res
      .status(200)
      .json({ Status: true, Message: "המשתמש עודכן בהצלחה" });
  });
});

// === שליפת עובדים פעילים ===
router.get("/active", verifyToken, (req, res) => {
  const query = "SELECT * FROM users WHERE is_active = 1";
  connection.query(query, (err, results) => {
    if (err)
      return res.status(500).json({ Status: false, Error: "שגיאה במסד" });
    res.status(200).json({ Status: true, Result: results });
  });
});

// === שליפת עובדים לא פעילים ===
router.get("/inactive", verifyToken, (req, res) => {
  const query = "SELECT * FROM users WHERE is_active = 0";
  connection.query(query, (err, results) => {
    if (err)
      return res.status(500).json({ Status: false, Error: "שגיאה במסד" });
    res.status(200).json({ Status: true, Result: results });
  });
});

// === שליפת משתמש בודד לפי מזהה ===
router.get("/:id", verifyToken, (req, res) => {
  const userId = req.params.id;

  const query = "SELECT * FROM users WHERE user_id = ?";
  connection.query(query, [userId], (err, results) => {
    if (err)
      return res.status(500).json({ Status: false, Error: "Database Error" });

    if (results.length === 0) {
      return res.status(404).json({ Status: false, Error: "המשתמש לא נמצא" });
    }

    res.status(200).json({ Status: true, User: results[0] });
  });
});

// === שליפת פרטי עסק ===
router.get("/business", verifyToken, (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(BUSINESS_JSON));
    res.json({ Business: data });
  } catch (err) {
    res.status(500).json({ error: "שגיאה בשליפת נתוני עסק" });
  }
});

// === עדכון פרטי עסק כולל לוגו ===
router.put("/business", verifyToken, upload.single("logo"), (req, res) => {
  try {
    let data = JSON.parse(fs.readFileSync(BUSINESS_JSON));
    data.business_name = req.body.business_name;
    data.address = req.body.address;
    data.phone = req.body.phone;

    if (req.file) {
      if (data.logo && data.logo !== "/uploads/logos/default.png") {
        const oldPath = "." + data.logo;
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }

      data.logo = "/uploads/logos/" + req.file.filename;
    }

    fs.writeFileSync(BUSINESS_JSON, JSON.stringify(data, null, 2));
    res.json({ message: "עודכן בהצלחה", logo: data.logo });
  } catch (err) {
    console.error("שגיאה בעדכון פרטי עסק:", err);
    res.status(500).json({ error: "שגיאה בעדכון נתונים" });
  }
});

// === מחיקה לוגית של משתמש (השבתה) ===
router.put("/delete/:id", verifyToken, (req, res) => {
  const userId = req.params.id;

  const query = `
    UPDATE users SET is_active = 0
    WHERE user_id = ?
  `;

  connection.query(query, [userId], (err, result) => {
    if (err) {
      console.error("שגיאה בהשבתת משתמש:", err);
      return res.status(500).json({ Status: false, Error: "Database Error" });
    }

    logAction("השבתת משתמש", req.user?.user_id)(req, res, () => {});

    res.status(200).json({ Status: true, Message: "המשתמש הושבת בהצלחה" });
  });
});

export default router;

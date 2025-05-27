import express from "express";
import path from "path";
import fs from "fs";
import multer from "multer";
import dbSingleton from "../utils/dbSingleton.js";
import logAction from "../utils/logAction.js";
import verifyToken from "../utils/verifyToken.js";

const connection = dbSingleton.getConnection();
const router = express.Router();

// === קבועים לשימוש חוזר ===
const LOGO_UPLOAD_DIR = "./uploads/logos";
const BUSINESS_JSON = "./data/business.json";

// === אחסון לוגו עם Multer ===
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

// === שליפת עובדים פעילים (רק למנהל כללי) ===
router.get("/active", verifyToken, (req, res) => {
  // if (req.user.role_id !== 1)
  //   return res.status(403).json({ message: "אין הרשאות לצפייה" });

  const query = "SELECT * FROM users WHERE is_active = 1";
  connection.query(query, (err, results) => {
    if (err)
      return res.status(500).json({ Status: false, Error: "שגיאה במסד" });
    res.status(200).json({ Status: true, Result: results });
  });
});

// === שליפת עובדים לא פעילים (רק למנהל כללי) ===
router.get("/inactive", verifyToken, (req, res) => {
  // if (req.user.role_id !== 1)
  //   return res.status(403).json({ message: "אין הרשאות לצפייה" });

  const query = "SELECT * FROM users WHERE is_active = 0";
  connection.query(query, (err, results) => {
    if (err)
      return res.status(500).json({ Status: false, Error: "שגיאה במסד" });
    res.status(200).json({ Status: true, Result: results });
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

// === עדכון פרטי עסק כולל העלאת לוגו ===
router.put("/business", verifyToken, upload.single("logo"), (req, res) => {
  try {
    let data = JSON.parse(fs.readFileSync(BUSINESS_JSON));
    data.business_name = req.body.business_name;
    data.address = req.body.address;
    data.phone = req.body.phone;

    if (req.file) {
      // מחיקת לוגו קודם אם קיים
      if (data.logo && data.logo !== "/uploads/logos/default.png") {
        const oldPath = "." + data.logo;
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }

      // הגדרת נתיב חדש
      data.logo = "/uploads/logos/" + req.file.filename;
    }

    fs.writeFileSync(BUSINESS_JSON, JSON.stringify(data, null, 2));
    res.json({ message: "עודכן בהצלחה", logo: data.logo });
  } catch (err) {
    console.error("שגיאה בעדכון פרטי עסק:", err);
    res.status(500).json({ error: "שגיאה בעדכון נתונים" });
  }
});

export default router;

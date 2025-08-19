import express from "express";
import { db } from "../utils/dbSingleton.js";
import verifyToken from "../utils/verifyToken.js";
import logAction from "../utils/logAction.js";
import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";
import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";
import Bidi from "bidi-js"; 

const router = express.Router();

// ✅ שליפת לוגים
router.get("/", verifyToken, async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 14;
  const offset = (page - 1) * limit;
  const search = req.query.search || "";
  const startDate = req.query.from;
  const endDate = req.query.to;

  let whereClause = "WHERE 1=1";
  const params = [];

  if (search) {
    whereClause += ` AND (
      l.log_id LIKE ? OR
      u.first_name LIKE ? OR
      u.last_name LIKE ? OR
      CONCAT(u.first_name, ' ', u.last_name) LIKE ? OR
      l.action_name LIKE ?
    )`;
    const likeSearch = `%${search}%`;
    params.push(likeSearch, likeSearch, likeSearch, likeSearch, likeSearch);
  }
  if (startDate) {
    whereClause += " AND DATE(l.time_date) >= ?";
    params.push(startDate);
  }
  if (endDate) {
    whereClause += " AND DATE(l.time_date) <= ?";
    params.push(endDate);
  }

  const dataQuery = `
    SELECT l.log_id, CONCAT(u.first_name, ' ', u.last_name) AS user_name, l.action_name AS action, l.time_date AS timestamp
    FROM user_activity_log l
    JOIN users u ON l.user_id = u.user_id
    ${whereClause}
    ORDER BY l.time_date DESC
    LIMIT ? OFFSET ?
  `;

  const countQuery = `
    SELECT COUNT(*) AS total
    FROM user_activity_log l
    JOIN users u ON l.user_id = u.user_id
    ${whereClause}
  `;

  try {
    const [[countResult]] = await db.query(countQuery, params);
    const total = countResult.total;

    const [dataResults] = await db.query(dataQuery, [...params, limit, offset]);

    res.json({ Result: dataResults, total });
  } catch (err) {
    console.error("שגיאה בשליפת לוגים:", err);
    return res.status(500).json({ success: false, message: "שגיאה בשרת" });
  }
});

// ✅ ייצוא לוגים לאקסל עם תאריך + שעה
router.get("/export/excel", verifyToken, async (req, res) => {
  const { search = "", from, to } = req.query;

  let whereClause = "WHERE 1=1";
  const params = [];

  if (search) {
    whereClause += ` AND (
      l.log_id LIKE ? OR
      u.first_name LIKE ? OR
      u.last_name LIKE ? OR
      CONCAT(u.first_name, ' ', u.last_name) LIKE ? OR
      l.action_name LIKE ?
    )`;
    const likeSearch = `%${search}%`;
    params.push(likeSearch, likeSearch, likeSearch, likeSearch, likeSearch);
  }

  if (from) {
    whereClause += " AND DATE(l.time_date) >= ?";
    params.push(from);
  }

  if (to) {
    whereClause += " AND DATE(l.time_date) <= ?";
    params.push(to);
  }

  const query = `
    SELECT l.log_id, CONCAT(u.first_name, ' ', u.last_name) AS user_name,
            l.action_name AS action, l.time_date AS timestamp
    FROM user_activity_log l
    JOIN users u ON l.user_id = u.user_id
    ${whereClause}
    ORDER BY l.time_date DESC
  `;

  try {
    const [results] = await db.query(query, params);

    if (results.length === 0) {
      return res.status(404).json({ error: "לא נמצאו נתונים לייצוא" });
    }

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Logs");

    sheet.columns = [
      { header: "מזהה", key: "log_id", width: 10 },
      { header: "שם עובד", key: "user_name", width: 30 },
      { header: "פעולה", key: "action", width: 40 },
      {
        header: "תאריך ושעה",
        key: "timestamp",
        width: 25,
        style: { numFmt: "dd/mm/yyyy hh:mm" },
      },
    ];

    results.forEach((row) => {
      sheet.addRow({
        log_id: row.log_id,
        user_name: row.user_name,
        action: row.action,
        timestamp: new Date(row.timestamp),
      });
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", "attachment; filename=logs.xlsx");
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error("שגיאה בייצוא לאקסל:", err);
    return res.status(500).json({ error: "שגיאה בשליפת נתונים" });
  }
});

// ✅ ייצוא לוגים ל-PDF עם תמיכה בעברית (הוספת פונט עברי)
router.get("/export/pdf", verifyToken, async (req, res) => {
  const { search = "", from, to } = req.query;

  let whereClause = "WHERE 1=1";
  const params = [];

  if (search) {
    whereClause += ` AND (
      l.log_id LIKE ? OR
      u.first_name LIKE ? OR
      u.last_name LIKE ? OR
      CONCAT(u.first_name, ' ', u.last_name) LIKE ? OR
      l.action_name LIKE ?
    )`;
    const likeSearch = `%${search}%`;
    params.push(likeSearch, likeSearch, likeSearch, likeSearch, likeSearch);
  }

  if (from) {
    whereClause += " AND DATE(l.time_date) >= ?";
    params.push(from);
  }

  if (to) {
    whereClause += " AND DATE(l.time_date) <= ?";
    params.push(to);
  }

  const query = `
    SELECT l.log_id, CONCAT(u.first_name, ' ', u.last_name) AS user_name,
            l.action_name AS action, l.time_date AS timestamp
    FROM user_activity_log l
    JOIN users u ON l.user_id = u.user_id
    ${whereClause}
    ORDER BY l.time_date DESC
  `;

  try {
    const [results] = await db.query(query, params);
    if (results.length === 0) {
      return res.status(404).json({ error: "לא נמצאו נתונים לייצוא" });
    }

    const doc = new PDFDocument({ margin: 40 });
    const fontPath = path.join(__dirname, "fonts", "Alef-Regular.ttf");

    try {
      if (fs.existsSync(fontPath)) {
        doc.registerFont("hebrew", fontPath);
        doc.font("hebrew");
      } else {
        doc.font("Helvetica"); // fallback
      }
    } catch (e) {
      console.error("שגיאה ברישום פונט:", e);
      doc.font("Helvetica");
    }

    res.setHeader("Content-Disposition", "attachment; filename=logs.pdf");
    res.setHeader("Content-Type", "application/pdf");
    doc.pipe(res);

    doc.fontSize(18).text("יומן פעולות - מערכת", { align: "center" });
    doc.moveDown();

    results.forEach((log) => {
      doc
        .fontSize(12)
        .text(
          `מזהה: ${log.log_id} | עובד: ${log.user_name} | פעולה: ${
            log.action
          } | תאריך: ${new Date(log.timestamp).toLocaleString("he-IL")}`,
          { align: "right" }
        );
      doc.moveDown(0.5);
    });

    doc.end();
  } catch (err) {
    console.error("שגיאה בייצוא ל-PDF:", err);
    return res.status(500).json({ error: "שגיאה בשליפת נתונים" });
  }
});

// ✅ שליחת מייל עם לוג PDF
router.post("/send-mail", verifyToken, async (req, res) => {
  const { email, search = "", from, to } = req.body;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  let whereClause = "WHERE 1=1";
  const params = [];

  if (search) {
    whereClause += ` AND (
      l.log_id LIKE ? OR
      u.first_name LIKE ? OR
      u.last_name LIKE ? OR
      CONCAT(u.first_name, ' ', u.last_name) LIKE ? OR
      l.action_name LIKE ?
    )`;
    const likeSearch = `%${search}%`;
    params.push(likeSearch, likeSearch, likeSearch, likeSearch, likeSearch);
  }

  if (from) {
    whereClause += " AND DATE(l.time_date) >= ?";
    params.push(from);
  }

  if (to) {
    whereClause += " AND DATE(l.time_date) <= ?";
    params.push(to);
  }

  const query = `
    SELECT l.log_id, CONCAT(u.first_name, ' ', u.last_name) AS user_name, l.action_name AS action, l.time_date AS timestamp
    FROM user_activity_log l
    JOIN users u ON l.user_id = u.user_id
    ${whereClause}
    ORDER BY l.time_date DESC
  `;

  try {
    const [results] = await db.query(query, params);

    if (results.length === 0) {
      return res.status(404).json({ error: "לא נמצאו נתונים לשליחה" });
    }

    const doc = new PDFDocument();
    const chunks = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", async () => {
      const pdfBuffer = Buffer.concat(chunks);

      const message = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: Bidi.stripMarks("יומן פעולות - מערכת"),
        text: Bidi.stripMarks("מצורף קובץ יומן לוגים בפורמט PDF"),
        attachments: [
          {
            filename: "logs.pdf",
            content: pdfBuffer,
          },
        ],
      };

      try {
        await transporter.sendMail(message);
        res.json({ success: true, message: "המייל נשלח בהצלחה" });
      } catch (mailErr) {
        console.error("שגיאה בשליחת מייל:", mailErr);
        return res
          .status(500)
          .json({ success: false, error: "שגיאה בשליחת המייל" });
      }
    });

    doc.fontSize(18).text("יומן פעולות - מערכת", { align: "center" });
    doc.moveDown();

    results.forEach((log) => {
      doc
        .fontSize(12)
        .text(
          `מזהה: ${log.log_id} | עובד: ${log.user_name} | פעולה: ${
            log.action
          } | תאריך: ${new Date(log.timestamp).toLocaleString("he-IL")}`
        );
      doc.moveDown(0.5);
    });

    doc.end();
  } catch (err) {
    console.error("שגיאה בשליפת נתונים לשליחת מייל:", err);
    return res
      .status(500)
      .json({ success: false, error: "שגיאה בשליפת נתונים" });
  }
});

// ✅ שליפת כל הלוגים לצורך ייצוא/הדפסה לפי סינון בלבד (ללא עמודים)
router.get("/all", verifyToken, async (req, res) => {
  const search = req.query.search || "";
  const startDate = req.query.from;
  const endDate = req.query.to;

  let whereClause = "WHERE 1=1";
  const params = [];

  if (search) {
    whereClause += ` AND (
      l.log_id LIKE ? OR
      u.first_name LIKE ? OR
      u.last_name LIKE ? OR
      CONCAT(u.first_name, ' ', u.last_name) LIKE ? OR
      l.action_name LIKE ?
    )`;
    const likeSearch = `%${search}%`;
    params.push(likeSearch, likeSearch, likeSearch, likeSearch, likeSearch);
  }

  if (startDate) {
    whereClause += " AND DATE(l.time_date) >= ?";
    params.push(startDate);
  }
  if (endDate) {
    whereClause += " AND DATE(l.time_date) <= ?";
    params.push(endDate);
  }

  const query = `
    SELECT l.log_id, CONCAT(u.first_name, ' ', u.last_name) AS user_name, l.action_name AS action, l.time_date AS timestamp
    FROM user_activity_log l
    JOIN users u ON l.user_id = u.user_id
    ${whereClause}
    ORDER BY l.time_date DESC
  `;

  try {
    const [results] = await db.query(query, params);
    res.json({ success: true, Result: results });
  } catch (err) {
    console.error("שגיאה בשליפת כל הלוגים:", err);
    return res.status(500).json({ success: false, message: "שגיאה בשרת" });
  }
});

// ✅ שליפת כל המשתמשים הפעילים
router.get("/users/get-all", verifyToken, async (req, res) => {
  const sql = `
    SELECT user_id, first_name, last_name
    FROM users
    WHERE is_active = 1
  `;
  try {
    const [results] = await db.query(sql);
    res.json({ Status: true, Result: results });
  } catch (err) {
    console.error("שגיאה בשליפת משתמשים:", err);
    return res.status(500).json({ Status: false, Error: "שגיאה בשרת" });
  }
});

export default router;

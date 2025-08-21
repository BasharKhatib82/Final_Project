import express from "express";
import { db } from "../utils/dbSingleton.js";
import verifyToken from "../utils/verifyToken.js";
import ExcelJS from "exceljs";
import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Bidi from "bidi-js";

const router = express.Router();

// ✅ הגדרת __dirname ל-ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ===================== פונקציות עזר =====================

// בונה WHERE לפי פרמטרים
const buildWhereClause = (search, from, to, params) => {
  let where = "WHERE 1=1";
  if (search) {
    where += ` AND (
      l.log_id LIKE ? OR
      u.first_name LIKE ? OR
      u.last_name LIKE ? OR
      CONCAT(u.first_name, ' ', u.last_name) LIKE ? OR
      l.action_name LIKE ?
    )`;
    const like = `%${search}%`;
    params.push(like, like, like, like, like);
  }
  if (from) {
    where += " AND DATE(l.time_date) >= ?";
    params.push(from);
  }
  if (to) {
    where += " AND DATE(l.time_date) <= ?";
    params.push(to);
  }
  return where;
};

// שליפת לוגים גנרית מה־DB
const getLogs = async ({ search = "", from, to, limit, offset }) => {
  const params = [];
  const where = buildWhereClause(search, from, to, params);

  const baseQuery = `
    SELECT l.log_id, CONCAT(u.first_name, ' ', u.last_name) AS user_name,
           l.action_name AS action, l.time_date AS timestamp
    FROM user_activity_log l
    JOIN users u ON l.user_id = u.user_id
    ${where}
    ORDER BY l.time_date DESC
  `;

  const countQuery = `
    SELECT COUNT(*) AS total
    FROM user_activity_log l
    JOIN users u ON l.user_id = u.user_id
    ${where}
  `;

  const [[{ total }]] = await db.query(countQuery, params);

  let dataQuery = baseQuery;
  if (limit) {
    dataQuery += " LIMIT ? OFFSET ?";
    params.push(limit, offset || 0);
  }

  const [rows] = await db.query(dataQuery, params);
  return { rows, total };
};

// ייצוא לאקסל
const exportToExcel = async (logs, res) => {
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

  logs.forEach((row) =>
    sheet.addRow({
      log_id: row.log_id,
      user_name: row.user_name,
      action: row.action,
      timestamp: new Date(row.timestamp),
    })
  );

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader("Content-Disposition", "attachment; filename=logs.xlsx");
  await workbook.xlsx.write(res);
  res.end();
};

// ייצוא ל־PDF
const exportToPDF = (logs, res) => {
  const doc = new PDFDocument({ margin: 40 });
  const fontPath = path.join(__dirname, "../fonts/Alef-Regular.ttf");

  if (fs.existsSync(fontPath)) {
    doc.registerFont("hebrew", fontPath);
    doc.font("hebrew");
  } else {
    doc.font("Helvetica");
  }

  res.setHeader("Content-Disposition", "attachment; filename=logs.pdf");
  res.setHeader("Content-Type", "application/pdf");
  doc.pipe(res);

  doc.fontSize(18).text("יומן פעולות - מערכת", { align: "center" }).moveDown();

  logs.forEach((log) => {
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
};

// שליחת לוגים במייל
const sendLogsByMail = async (logs, email) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: process.env.SMTP_PORT || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // הפקת PDF בבאפר
  const doc = new PDFDocument();
  const chunks = [];
  doc.on("data", (chunk) => chunks.push(chunk));

  return new Promise((resolve, reject) => {
    doc.on("end", async () => {
      const pdfBuffer = Buffer.concat(chunks);
      try {
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: email,
          subject: Bidi.stripMarks("יומן פעולות - מערכת"),
          text: Bidi.stripMarks("מצורף קובץ יומן לוגים בפורמט PDF"),
          attachments: [{ filename: "logs.pdf", content: pdfBuffer }],
        });
        resolve();
      } catch (err) {
        reject(err);
      }
    });

    doc
      .fontSize(18)
      .text("יומן פעולות - מערכת", { align: "center" })
      .moveDown();
    logs.forEach((log) => {
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
  });
};

// ===================== ראוטים =====================

// שליפת לוגים עם עמודים
router.get("/", verifyToken, async (req, res) => {
  const { page = 1, search = "", from, to } = req.query;
  const limit = 14;
  const offset = (page - 1) * limit;

  try {
    const { rows, total } = await getLogs({ search, from, to, limit, offset });
    res.json({ success: true, Result: rows, total });
  } catch (err) {
    console.error("❌ שגיאה:", err);
    res.status(500).json({ success: false, error: "שגיאת שרת" });
  }
});

// ייצוא לאקסל
router.get("/export/excel", verifyToken, async (req, res) => {
  try {
    const { search, from, to } = req.query;
    const { rows } = await getLogs({ search, from, to });
    if (rows.length === 0)
      return res.status(404).json({ success: false, error: "אין נתונים" });
    await exportToExcel(rows, res);
  } catch (err) {
    console.error("❌ Excel:", err);
    res.status(500).json({ success: false, error: "שגיאה" });
  }
});

// ייצוא ל-PDF
router.get("/export/pdf", verifyToken, async (req, res) => {
  try {
    const { search, from, to } = req.query;
    const { rows } = await getLogs({ search, from, to });
    if (rows.length === 0)
      return res.status(404).json({ success: false, error: "אין נתונים" });
    exportToPDF(rows, res);
  } catch (err) {
    console.error("❌ PDF:", err);
    res.status(500).json({ success: false, error: "שגיאה" });
  }
});

// שליחת לוגים במייל
router.post("/send-mail", verifyToken, async (req, res) => {
  const { email, search, from, to } = req.body;
  if (!email)
    return res.status(400).json({ success: false, error: "חסר אימייל" });

  try {
    const { rows } = await getLogs({ search, from, to });
    if (rows.length === 0)
      return res
        .status(404)
        .json({ success: false, error: "אין נתונים לשליחה" });
    await sendLogsByMail(rows, email);
    res.json({ success: true, message: "המייל נשלח בהצלחה" });
  } catch (err) {
    console.error("❌ מייל:", err);
    res.status(500).json({ success: false, error: "שגיאה בשליחת מייל" });
  }
});

// שליפת כל הלוגים (בלי עמודים)
router.get("/all", verifyToken, async (req, res) => {
  try {
    const { search, from, to } = req.query;
    const { rows } = await getLogs({ search, from, to });
    res.json({ success: true, Result: rows });
  } catch (err) {
    console.error("❌ כל הלוגים:", err);
    res.status(500).json({ success: false, error: "שגיאה" });
  }
});

export default router;

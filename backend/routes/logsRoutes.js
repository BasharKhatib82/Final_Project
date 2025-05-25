import express from "express";
import verifyToken from "../utils/verifyToken.js";
import dbSingleton from "../utils/dbSingleton.js";
import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";
import nodemailer from "nodemailer";
import path from "path";

const router = express.Router();
const connection = dbSingleton.getConnection();

// ✅ שליפת לוגים
router.get("/", verifyToken, (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 12;
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

  connection.query(countQuery, params, (countErr, countResults) => {
    if (countErr) return res.status(500).json({ success: false });
    const total = countResults[0].total;

    connection.query(
      dataQuery,
      [...params, limit, offset],
      (err, dataResults) => {
        if (err) return res.status(500).json({ success: false });
        res.json({ Result: dataResults, total });
      }
    );
  });
});

// ✅ ייצוא לוגים לאקסל עם תאריך + שעה
// ✅ ייצוא לוגים לאקסל עם תאריך + שעה
router.get("/export/excel", verifyToken, (req, res) => {
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

  connection.query(query, params, async (err, results) => {
    if (err) return res.status(500).json({ error: "שגיאה בשליפת נתונים" });

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
  });
});

// ✅ ייצוא לוגים ל-PDF עם תמיכה בעברית (הוספת פונט עברי)
router.get("/export/pdf", verifyToken, (req, res) => {
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

  connection.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: "שגיאה בשליפת נתונים" });

    const doc = new PDFDocument({ margin: 40 });
    const fontP = "backend/fonts/Alef-Regular.ttf";
    console.log(fontP);
    try {
      if (fs.existsSync(fontP)) {
        doc.registerFont("hebrew", fontP);
        doc.font("hebrew");
      } else {
        doc.font("Helvetica"); // fallback
      }
    } catch (e) {
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
  });
});

// ✅ שליחת מייל עם לוג PDF
router.post("/send-mail", verifyToken, (req, res) => {
  const { email } = req.body;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const query = `
    SELECT l.log_id, CONCAT(u.first_name, ' ', u.last_name) AS user_name, l.action_name AS action, l.time_date AS timestamp
    FROM user_activity_log l
    JOIN users u ON l.user_id = u.user_id
    ORDER BY l.time_date DESC
  `;

  connection.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: "שגיאה בשליפת נתונים" });

    const doc = new PDFDocument();
    const chunks = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => {
      const pdfBuffer = Buffer.concat(chunks);

      const message = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "יומן פעולות - מערכת",
        text: "מצורף קובץ יומן לוגים בפורמט PDF",
        attachments: [
          {
            filename: "logs.pdf",
            content: pdfBuffer,
          },
        ],
      };

      transporter.sendMail(message, (mailErr, info) => {
        if (mailErr)
          return res.status(500).json({ success: false, error: mailErr });
        res.json({ success: true, info });
      });
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
  });
});

// ✅ שליפת כל הלוגים לצורך ייצוא/הדפסה לפי סינון בלבד (ללא עמודים)
router.get("/all", verifyToken, (req, res) => {
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

  connection.query(query, params, (err, results) => {
    if (err)
      return res.status(500).json({ success: false, message: "שגיאה בשרת" });
    res.json({ success: true, Result: results });
  });
});

export default router;

// controllers/logs.controller.js

import { db } from "../utils/dbSingleton.js";
import ExcelJS from "exceljs";
import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import PDFDocument from "pdfkit"; // ← חייב pdfkit מותקן: npm i pdfkit
import Bidi from "bidi-js";
import {
  buildWhereClause,
  isValidDate,
  parsePage,
} from "../utils/logs.helpers.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// מיקום פונט עברית (ננסה public/fonts תחילה, אח"כ ../fonts)
const FONT_CANDIDATES = [
  path.join(process.cwd(), "public", "fonts", "Alef-Regular.ttf"),
  path.join(process.cwd(), "public", "fonts", "Rubik-Regular.ttf"),
  path.join(__dirname, "../fonts/Alef-Regular.ttf"),
];

/**
 * טעינת פונט עברית אם קיים
 */
function registerHebrewFont(doc) {
  const fontPath = FONT_CANDIDATES.find((p) => fs.existsSync(p));
  if (fontPath) {
    doc.registerFont("hebrew", fontPath);
    doc.font("hebrew");
  } else {
    doc.font("Helvetica");
  }
}

/**
 * שליפה מה־DB של לוגים עם/בלי עמודים
 * מקבל: { search?, from?, to?, limit?, offset? }
 * מחזיר: { rows, total }
 */
async function queryLogs({ search = "", from, to, limit, offset }) {
  const { where, params } = buildWhereClause({ search, from, to });

  const baseQuery = `
    SELECT l.log_id,
           CONCAT(u.first_name, ' ', u.last_name) AS user_name,
           l.action_name AS action,
           l.time_date AS timestamp
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

  const [[{ total }]] = await db.query(countQuery, [...params]);

  let dataQuery = baseQuery;
  const dataParams = [...params];
  if (typeof limit === "number") {
    dataQuery += " LIMIT ? OFFSET ?";
    dataParams.push(limit, Number(offset) || 0);
  }

  const [rows] = await db.query(dataQuery, dataParams);
  return { rows, total };
}

/**
 * בניית קובץ Excel (שולח ישירות ל־res)
 * מקבל: rows[], res
 */
async function exportToExcel(rows, res) {
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

  rows.forEach((r) =>
    sheet.addRow({
      log_id: r.log_id,
      user_name: r.user_name,
      action: r.action,
      timestamp: new Date(r.timestamp),
    })
  );

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader("Content-Disposition", `attachment; filename=logs.xlsx`);
  await workbook.xlsx.write(res);
  res.end();
}

/**
 * בניית PDF לרספונס (stream)
 * מקבל: rows[], res
 */
function exportToPDF(rows, res, title = "יומן פעולות - מערכת") {
  const doc = new PDFDocument({ margin: 40 });
  registerHebrewFont(doc);

  res.setHeader("Content-Disposition", "attachment; filename=logs.pdf");
  res.setHeader("Content-Type", "application/pdf");
  doc.pipe(res);

  doc.fontSize(18).text(title, { align: "center" }).moveDown();

  rows.forEach((log) => {
    doc
      .fontSize(12)
      .text(
        Bidi.stripMarks(
          `מזהה: ${log.log_id} | עובד: ${log.user_name} | פעולה: ${
            log.action
          } | תאריך: ${new Date(log.timestamp).toLocaleString("he-IL")}`
        ),
        { align: "right" }
      )
      .moveDown(0.5);
  });

  doc.end();
}

/**
 * הכנת PDF לבאפר (לשליחה במייל)
 * מחזיר: Promise<Buffer>
 */
function buildPDFBuffer(rows, title = "יומן פעולות - מערכת") {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40 });
    registerHebrewFont(doc);

    const chunks = [];
    doc.on("data", (c) => chunks.push(c));
    doc.on("error", reject);
    doc.on("end", () => resolve(Buffer.concat(chunks)));

    doc.fontSize(18).text(title, { align: "center" }).moveDown();

    rows.forEach((log) => {
      doc
        .fontSize(12)
        .text(
          Bidi.stripMarks(
            `מזהה: ${log.log_id} | עובד: ${log.user_name} | פעולה: ${
              log.action
            } | תאריך: ${new Date(log.timestamp).toLocaleString("he-IL")}`
          ),
          { align: "right" }
        )
        .moveDown(0.5);
    });

    doc.end();
  });
}

/**
 * שליפת לוגים עם עמודים
 * מקבל: Query { page?, search?, from?, to? }
 * מחזיר: { success, data, total, page, limit }
 */
export async function listLogs(req, res) {
  const page = parsePage(req.query.page);
  const search = String(req.query.search || "").trim();
  const from = req.query.from || null;
  const to = req.query.to || null;
  const limit = 14;
  const offset = (page - 1) * limit;

  if (from && !isValidDate(from)) {
    return res
      .status(400)
      .json({ success: false, message: "from חייב להיות בפורמט YYYY-MM-DD" });
  }
  if (to && !isValidDate(to)) {
    return res
      .status(400)
      .json({ success: false, message: "to חייב להיות בפורמט YYYY-MM-DD" });
  }

  try {
    const { rows, total } = await queryLogs({
      search,
      from,
      to,
      limit,
      offset,
    });
    return res.json({ success: true, data: rows, total, page, limit });
  } catch (err) {
    console.error("listLogs:", err);
    return res.status(500).json({ success: false, message: "שגיאת שרת" });
  }
}

/**
 * שליפת כל הלוגים (ללא עמודים)
 * מקבל: Query { search?, from?, to? }
 * מחזיר: { success, data }
 */
export async function listAllLogs(req, res) {
  const search = String(req.query.search || "").trim();
  const from = req.query.from || null;
  const to = req.query.to || null;

  if (from && !isValidDate(from)) {
    return res
      .status(400)
      .json({ success: false, message: "from חייב להיות בפורמט YYYY-MM-DD" });
  }
  if (to && !isValidDate(to)) {
    return res
      .status(400)
      .json({ success: false, message: "to חייב להיות בפורמט YYYY-MM-DD" });
  }

  try {
    const { rows } = await queryLogs({ search, from, to });
    return res.json({ success: true, data: rows });
  } catch (err) {
    console.error("listAllLogs:", err);
    return res.status(500).json({ success: false, message: "שגיאת שרת" });
  }
}

/**
 * ייצוא לאקסל
 * מקבל: Query { search?, from?, to? }
 * מחזיר: קובץ xlsx להורדה
 */
export async function exportLogsExcel(req, res) {
  const search = String(req.query.search || "").trim();
  const from = req.query.from || null;
  const to = req.query.to || null;

  if (from && !isValidDate(from))
    return res.status(400).json({ success: false, message: "from לא תקין" });
  if (to && !isValidDate(to))
    return res.status(400).json({ success: false, message: "to לא תקין" });

  try {
    const { rows } = await queryLogs({ search, from, to });
    if (rows.length === 0)
      return res.status(404).json({ success: false, message: "אין נתונים" });
    await exportToExcel(rows, res);
  } catch (err) {
    console.error("exportLogsExcel:", err);
    return res
      .status(500)
      .json({ success: false, message: "שגיאה ביצוא לאקסל" });
  }
}

/**
 * ייצוא ל-PDF
 * מקבל: Query { search?, from?, to? }
 * מחזיר: קובץ pdf להורדה
 */
export async function exportLogsPDF(req, res) {
  const search = String(req.query.search || "").trim();
  const from = req.query.from || null;
  const to = req.query.to || null;

  if (from && !isValidDate(from))
    return res.status(400).json({ success: false, message: "from לא תקין" });
  if (to && !isValidDate(to))
    return res.status(400).json({ success: false, message: "to לא תקין" });

  try {
    const { rows } = await queryLogs({ search, from, to });
    if (rows.length === 0)
      return res.status(404).json({ success: false, message: "אין נתונים" });
    exportToPDF(rows, res);
  } catch (err) {
    console.error("exportLogsPDF:", err);
    return res.status(500).json({ success: false, message: "שגיאה ביצוא PDF" });
  }
}

/**
 * שליחת לוגים במייל (PDF מצורף)
 * מקבל: Body { email, search?, from?, to? }
 * מחזיר: { success, message }
 */
export async function sendLogsByEmail(req, res) {
  const email = String(req.body.email || "").trim();
  const search = String(req.body.search || "").trim();
  const from = req.body.from || null;
  const to = req.body.to || null;

  if (!email)
    return res.status(400).json({ success: false, message: "חסר אימייל" });
  if (from && !isValidDate(from))
    return res.status(400).json({ success: false, message: "from לא תקין" });
  if (to && !isValidDate(to))
    return res.status(400).json({ success: false, message: "to לא תקין" });

  try {
    const { rows } = await queryLogs({ search, from, to });
    if (rows.length === 0)
      return res
        .status(404)
        .json({ success: false, message: "אין נתונים לשליחה" });

    const pdfBuffer = await buildPDFBuffer(rows);

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: String(process.env.SMTP_SECURE || "false") === "true",
      auth: {
        user: process.env.SMTP_USER || process.env.EMAIL_USER, // תמיכה לאחור
        pass: process.env.SMTP_PASS || process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"CRM Logs" <${process.env.SMTP_USER || process.env.EMAIL_USER}>`,
      to: email,
      subject: Bidi.stripMarks("יומן פעולות - מערכת"),
      text: Bidi.stripMarks("מצורף קובץ יומן לוגים בפורמט PDF"),
      attachments: [{ filename: "logs.pdf", content: pdfBuffer }],
    });

    return res.json({ success: true, message: "המייל נשלח בהצלחה" });
  } catch (err) {
    console.error("sendLogsByEmail:", err);
    return res
      .status(500)
      .json({ success: false, message: "שגיאה בשליחת מייל" });
  }
}

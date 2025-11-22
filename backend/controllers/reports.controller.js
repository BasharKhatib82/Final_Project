// backend\controllers\reports.controller.js

import fs from "fs";
import { generateExcel, generatePdf } from "../utils/reports.generator.js";
import { sendReportEmail } from "../utils/reports.mailer.js";
import { validateAndSanitizeEmail } from "../utils/validateAndSanitizeEmail.js";

/**
 * בדיקת קלט בסיסית לדוח
 * מקבל: req, res
 * מחזיר: { title, columns, rows }
 */
function parseAndValidateBody(req, res) {
  const { title, columns, rows } = req.body ?? {};

  if (!title || typeof title !== "string") {
    res.status(400).json({ success: false, message: "חסר שם / כותרת דוח" });
    return null;
  }
  if (!Array.isArray(columns) || columns.length === 0) {
    res.status(400).json({ success: false, message: "חסרה רשימת עמודות" });
    return null;
  }
  if (!Array.isArray(rows)) {
    res.status(400).json({ success: false, message: "חסרה רשימת שורות" });
    return null;
  }

  //  בדיקה קלה למבנה העמודות: header/key כטקסט
  for (const col of columns) {
    //   תמיכה ב־label מהפרונט
    if (!col.header && col.label) {
      col.header = col.label;
    }

    if (typeof col !== "object" || !col) {
      res.status(400).json({ success: false, message: "מבנה columns לא תקין" });
      return null;
    }
    if (!col.header || typeof col.header !== "string") {
      res.status(400).json({
        success: false,
        message: "כל עמודה חייבת לכלול header מסוג string",
      });
      return null;
    }
    if (!col.key || typeof col.key !== "string") {
      res.status(400).json({
        success: false,
        message: "כל עמודה חייבת לכלול key מסוג string",
      });
      return null;
    }
  }

  return { title: title.trim(), columns, rows };
}

/**
 * הורדת דוח (Excel/PDF)
 * ומחזיר להורדה(xlsx/pdf) : יוצר קובץ דוח
 * מה מקבל (Body): { title, columns[], rows[], format?='xlsx' }
 * מחזיר: קובץ להורדה או הודעת שגיאה.
 */
export async function downloadReport(req, res) {
  const parsed = parseAndValidateBody(req, res);
  if (!parsed) return;

  try {
    const { format = "xlsx" } = req.body;
    const { title, columns, rows } = parsed;

    if (format === "xlsx") {
      const { buffer, filename } = await generateExcel({
        title,
        columns,
        rows,
      });
      res.setHeader(
        "Content-Disposition",
        `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`
      );
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      return res.send(Buffer.from(buffer));
    }

    if (format === "pdf") {
      const { filePath, filename } = await generatePdf({
        title,
        columns,
        rows,
      });
      return res.download(filePath, filename, () =>
        fs.unlink(filePath, () => {})
      );
    }

    return res
      .status(400)
      .json({ success: false, message: "פורמט לא נתמך (format)" });
  } catch (err) {
    console.error("reports.downloadReport:", err);
    return res.status(500).json({ success: false, message: "כשל בהורדת הדוח" });
  }
}

/**
 * Preview בחלון PDF תצוגת
 * inline ומציג PDF : יוצר
 * מה מקבל (Body): { title, columns[], rows[] }
 * מה מחזיר: PDF inline או שגיאה.
 */
export async function previewReport(req, res) {
  try {
    const parsed = parseAndValidateBody(req, res);
    if (!parsed) return;

    const { title, columns, rows } = parsed;
    const { filePath, filename } = await generatePdf({ title, columns, rows });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename*=UTF-8''${encodeURIComponent(filename)}`
    );
    res.sendFile(filePath, () => fs.unlink(filePath, () => {}));
  } catch (err) {
    console.error("reports.previewReport:", err);
    return res
      .status(500)
      .json({ success: false, message: "כשל ביצירת תצוגת PDF" });
  }
}

/**
 * שליחת דוח במייל
 * ושולח במייל ליעד (xlsx/pdf) מה עושה: יוצר קובץ
 * מה מקבל (Body): { title, columns[], rows[], to, format?='xlsx' }
 * מה מחזיר: { success, message }
 */
export async function sendReportByEmail(req, res) {
  const parsed = parseAndValidateBody(req, res);
  if (!parsed) return;

  try {
    const { to, format = "xlsx" } = req.body;
    if (!to) {
      return res
        .status(400)
        .json({ success: false, message: "חסר יעד לשליחה (to)" });
    }

    let safeTo;
    try {
      safeTo = validateAndSanitizeEmail(to);
    } catch {
      return res
        .status(400)
        .json({ success: false, message: "כתובת מייל לא חוקית" });
    }

    const { title, columns, rows } = parsed;
    await sendReportEmail({ title, columns, rows, to: safeTo, format });

    return res.json({ success: true, message: "הדוח נשלח במייל בהצלחה" });
  } catch (err) {
    console.error("reports.sendReportByEmail:", err);
    return res
      .status(500)
      .json({ success: false, message: "שליחת הדוח נכשלה" });
  }
}

import express from "express";
import fs from "fs";
import {
  generateExcelBuffer,
  generatePdfFile,
} from "../utils/reports.generator.js";
import { sendReportEmail } from "../utils/reports.mailer.js";
import { validateAndSanitizeEmail } from "../utils/validateAndSanitizeEmail.js";

const router = express.Router();

/**
 * פונקציית עזר – בדיקה שהפרמטרים קיימים
 */
function validateReportInput(req, res) {
  const { title, columns, rows } = req.body;

  if (!title || typeof title !== "string") {
    res.status(400).json({ error: "חסר שם דוח (title)" });
    return false;
  }
  if (!Array.isArray(columns) || columns.length === 0) {
    res.status(400).json({ error: "חסרה רשימת עמודות (columns)" });
    return false;
  }
  if (!Array.isArray(rows)) {
    res.status(400).json({ error: "חסרה רשימת שורות (rows)" });
    return false;
  }

  return true;
}

// 📥 הורדת קובץ (Excel / PDF)
router.post("/download", async (req, res) => {
  if (!validateReportInput(req, res)) return;

  try {
    const { title, columns, rows, format = "xlsx" } = req.body;

    if (format === "xlsx") {
      const buffer = await generateExcelBuffer({ title, columns, rows });
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${title}.xlsx"`
      );
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      return res.send(Buffer.from(buffer));
    }

    if (format === "pdf") {
      const { filePath, filename } = await generatePdfFile({
        title,
        columns,
        rows,
      });
      return res.download(filePath, filename, () =>
        fs.unlink(filePath, () => {})
      );
    }

    res.status(400).json({ error: "פורמט לא נתמך" });
  } catch (err) {
    console.error("❌ download failed", err);
    res.status(500).json({ error: "כשל בהורדת הדוח" });
  }
});

// 🖨️ תצוגת PDF בחלון (Preview)
router.post("/preview", async (req, res) => {
  try {
    // 🔹 תמיכה גם ב־JSON וגם ב־Form POST
    let { title, columns, rows } = req.body;

    if (typeof columns === "string") {
      try {
        columns = JSON.parse(columns);
      } catch {
        columns = [];
      }
    }
    if (typeof rows === "string") {
      try {
        rows = JSON.parse(rows);
      } catch {
        rows = [];
      }
    }

    if (!title || !columns || !rows) {
      return res.status(400).json({ error: "Missing report data" });
    }

    const { filePath, filename } = await generatePdf({ title, columns, rows });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="${filename}"`);
    res.sendFile(filePath);
  } catch (err) {
    console.error("❌ preview failed", err);
    res.status(500).json({ error: "כשל ביצירת תצוגת PDF" });
  }
});

// 📩 שליחת דוח במייל
router.post("/send-email", async (req, res) => {
  if (!validateReportInput(req, res)) return;

  try {
    const { title, columns, rows, to, format = "xlsx" } = req.body;

    if (!to) {
      return res.status(400).json({ ok: false, error: "חסר יעד לשליחה (to)" });
    }

    let safeTo;
    try {
      safeTo = validateAndSanitizeEmail(to);
    } catch {
      return res.status(400).json({ ok: false, error: "כתובת מייל לא חוקית" });
    }

    await sendReportEmail({ title, columns, rows, to: safeTo, format });
    res.json({ ok: true });
  } catch (err) {
    console.error("❌ send-email failed:", err);
    res.status(500).json({ ok: false, error: "שליחת הדוח נכשלה" });
  }
});

export default router;

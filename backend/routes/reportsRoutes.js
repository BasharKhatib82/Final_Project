// backend/routes/reportsRoutes.js
import express from "express";
import { generateExcel, generatePdf } from "../utils/reports.generator.js";
import { sendReportEmail } from "../utils/reports.mailer.js";
import { validateAndSanitizeEmail } from "../utils/validateAndSanitizeEmail.js";
import fs from "fs";

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
    let result;

    if (format === "xlsx")
      result = await generateExcel({ title, columns, rows });
    else if (format === "pdf")
      result = await generatePdf({ title, columns, rows });
    else return res.status(400).json({ error: "פורמט לא נתמך" });

    res.download(result.filePath, result.filename, (err) => {
      if (err) console.error("❌ error sending file:", err);
      // מחיקת הקובץ אחרי שליחה
      fs.unlink(result.filePath, () => {});
    });
  } catch (err) {
    console.error("❌ download failed", err);
    res.status(500).json({ error: "כשל בהורדת הדוח" });
  }
});

// 🖨️ הצגת PDF בחלון Preview (להדפסה)
router.post("/preview", async (req, res) => {
  if (!validateReportInput(req, res)) return;

  try {
    const { title, columns, rows } = req.body;
    const { filePath, filename } = await generatePdf({ title, columns, rows });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="${filename}"`);
    res.sendFile(filePath, (err) => {
      // מוחקים את הקובץ אחרי שליחה
      fs.unlink(filePath, () => {});
    });
  } catch (err) {
    console.error("❌ preview failed", err);
    res.status(500).json({ error: "כשל ביצירת תצוגת PDF" });
  }
});

// 📩 שליחת דוח למייל (Excel / PDF)
router.post("/send-email", async (req, res) => {
  if (!validateReportInput(req, res)) return;

  try {
    const { title, columns, rows, to, format = "xlsx" } = req.body;

    if (!to) {
      return res.status(400).json({ ok: false, error: "חסר יעד לשליחה (to)" });
    }

    // ✅ ולידציה + ניקוי כתובת מייל
    let safeTo;
    try {
      safeTo = validateAndSanitizeEmail(to);
    } catch (err) {
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

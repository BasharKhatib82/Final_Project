// backend/utils/reports.mailer.js
import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";
import os from "os";
import { generateExcel, generatePdf } from "./reports.generator.js";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 465,
  secure: process.env.SMTP_SECURE === "true", // true: 465 (SSL), false: 587 (STARTTLS)
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// 📡 בדיקת SMTP עם עליית השרת
export function verifySmtp() {
  transporter.verify((err, ok) => {
    if (err) console.error("❌ SMTP verify failed:", err.message);
    else console.log("✅ SMTP server is ready to send emails");
  });
}

// 📨 שליחת דוח במייל
export async function sendReportEmail({
  title,
  columns,
  rows,
  to,
  format = "xlsx",
}) {
  if (!to) throw new Error("missing 'to'");

  let filePath, filename, buffer;

  if (format === "xlsx") {
    // ✅ Excel – נשתמש ב־buffer
    const excelResult = await generateExcel({ title, columns, rows });
    buffer = excelResult.buffer;
    filename = excelResult.filename;
  } else if (format === "pdf") {
    // ✅ PDF – נשתמש בקובץ זמני
    const pdfResult = await generatePdf({ title, columns, rows });
    filePath = pdfResult.filePath;
    filename = pdfResult.filename;
  } else {
    throw new Error(`unsupported format: ${format}`);
  }

  try {
    await transporter.sendMail({
      from: `"מערכת CRM" <${process.env.SMTP_USER}>`,
      to,
      subject: `דוח חדש מהמערכת: ${title}`,
      text: `מצורף הדוח "${title}" בפורמט ${format.toUpperCase()}.`,
      attachments: [
        format === "xlsx"
          ? { filename, content: buffer } // ✅ שולחים כ־buffer
          : { filename, path: filePath }, // ✅ שולחים כקובץ זמני
      ],
    });

    return { ok: true, filename };
  } finally {
    // ✅ ננקה רק קובץ PDF זמני (Excel נשלח כ-buffer)
    if (filePath && typeof filePath === "string") {
      fs.unlink(filePath, () => {});
    }
  }
}

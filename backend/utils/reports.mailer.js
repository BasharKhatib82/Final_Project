// backend/utils/reports.mailer.js
import nodemailer from "nodemailer";
import fs from "fs";
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

// 📨 שליחת דוח למייל
export async function sendReportEmail({
  title,
  columns,
  rows,
  to,
  format = "xlsx",
}) {
  if (!to) throw new Error("missing 'to'");

  let filePath, filename;

  // ✅ מייצר קובץ זמני לפי פורמט
  if (format === "xlsx") {
    ({ filePath, filename } = await generateExcel({ title, columns, rows }));
  } else if (format === "pdf") {
    ({ filePath, filename } = await generatePdf({ title, columns, rows }));
  } else {
    throw new Error(`unsupported format: ${format}`);
  }

  try {
    await transporter.sendMail({
      from: `"מערכת CRM" <${process.env.SMTP_USER}>`,
      to,
      subject: `דוח חדש מהמערכת: ${title}`,
      text: `מצורף הדוח "${title}" בפורמט ${format.toUpperCase()}.`,
      attachments: [{ filename, path: filePath }],
    });

    return { ok: true, filename }; // ✨ נחזיר גם את שם הקובץ
  } finally {
    // ניקוי הקובץ בכל מקרה
    fs.unlink(filePath, () => {});
  }
}

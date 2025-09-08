// backend/utils/reports.mailer.js

import nodemailer from "nodemailer";
import fs from "fs";
import { generateExcel, generatePdf } from "./reports.generator.js";

const SMTP_SECURE = String(process.env.SMTP_SECURE || "false") === "true";
const SMTP_PORT = Number(process.env.SMTP_PORT) || (SMTP_SECURE ? 465 : 587);
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const FROM_NAME = process.env.EMAIL_FROM_NAME || "מערכת CRM";

let transporter;

/**
 *  יחיד לשליחת מיילים SMTP : יוצר / מאחזר טרנספורטר
 * מה מקבל: —
 * מה מחזיר: nodemailer.Transporter
 */
function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_SECURE,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
      tls: {
        rejectUnauthorized: false,
      },
    });
  }
  return transporter;
}

/**
 * בזמן עליית השרת SMTP בדיקת
 * מה מקבל: —
 *  מחזיר: Promise<boolean> (true אם תקין)
 */
export async function verifySmtp() {
  try {
    await getTransporter().verify();
    console.log("✅ SMTP server is ready to send emails");
    return true;
  } catch (err) {
    console.error("SMTP verify failed:", err?.message || err);
    return false;
  }
}

/**
 * ושולח במייל ליעד (Excel/PDF) יוצר דוח
 * מה מקבל (Body):
 *   { title, columns, rows, to, format='xlsx' }
 *   - format: 'xlsx' | 'pdf'
 *  מחזיר: { success: true, filename } או זורק שגיאה במקרה כשל.
 */
export async function sendReportEmail({
  title,
  columns,
  rows,
  to,
  format = "xlsx",
}) {
  if (!to) throw new Error("חסר יעד לשליחה (to)");
  if (!SMTP_USER) throw new Error(" ENV לא מוגדר ב SMTP_USER");

  let filePath = null;
  let filename = null;
  let buffer = null;

  // יצירת הקובץ לפי פורמט
  if (format === "xlsx") {
    const { buffer: xlsxBuffer, filename: xlsxName } = await generateExcel({
      title,
      columns,
      rows,
    });
    buffer = xlsxBuffer;
    filename = xlsxName;
  } else if (format === "pdf") {
    const { filePath: pdfPath, filename: pdfName } = await generatePdf({
      title,
      columns,
      rows,
    });
    filePath = pdfPath;
    filename = pdfName;
  } else {
    throw new Error(`פורמט לא נתמך: ${format}`);
  }

  // שליחת המייל
  try {
    await getTransporter().sendMail({
      from: `"${FROM_NAME}" <${SMTP_USER}>`,
      to,
      subject: `דוח חדש מהמערכת: ${title}`,
      text: `מצורף הדוח "${title}" בפורמט ${format.toUpperCase()}.`,
      attachments: [
        format === "xlsx"
          ? {
              filename,
              content: Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer),
            }
          : { filename, path: filePath },
      ],
    });

    return { success: true, filename };
  } finally {
    // בלבד PDF ניקוי קובץ זמני של
    if (filePath) {
      fs.unlink(filePath, () => {});
    }
  }
}

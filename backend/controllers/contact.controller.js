// backend\controllers\contact.controller.js

import nodemailer from "nodemailer";
import { validateAndSanitizeEmail } from "../utils/validateAndSanitizeEmail.js";
import { isILPhone10 } from "../utils/fieldValidators.js";
import { escapeHtml } from "../utils/sanitizeHtml.js";

const SMTP_SECURE = String(process.env.SMTP_SECURE || "false") === "true";
const SMTP_PORT = Number(process.env.SMTP_PORT) || (SMTP_SECURE ? 465 : 587);

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_SECURE,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    // אם יש תעודה תקינה, מומלץ להסיר את השורה הבאה
    rejectUnauthorized: false,
  },
});

/**
 * שליחת טופס צור קשר
 * שולח את פרטי הפנייה במייל ליעד המוגדר במערכת
 * מה מקבל (Body): { fullName, email, phone, subject?, message }
 * מה מחזיר: { success, message }
 */
export async function sendContactForm(req, res) {
  let { fullName, email, phone, subject, message } = req.body || {};

  fullName = String(fullName || "").trim();
  email = String(email || "").trim();
  phone = String(phone || "").trim();
  subject = String(subject || "פנייה מהאתר").trim();
  message = String(message || "").trim();

  // שדות חובה
  if (!fullName || !email || !phone || !message) {
    return res
      .status(400)
      .json({ success: false, message: "נא למלא את כל שדות החובה" });
  }

  // אימייל
  let safeEmail;
  try {
    safeEmail = validateAndSanitizeEmail(email);
  } catch (e) {
    return res
      .status(400)
      .json({ success: false, message: e?.message || "כתובת אימייל לא תקינה" });
  }

  // טלפון : 10 ספרות, מתחיל ב 05
  if (!isILPhone10(phone)) {
    return res.status(400).json({
      success: false,
      message: "מספר טלפון חייב להיות 10 ספרות ולהתחיל ב 05",
    });
  }

  // תוכן מייל
  const toAddress = process.env.CONTACT_TO || "reports@respondify-crm.co.il";
  const fromAddress = `"Respondify CRM" <${process.env.SMTP_USER}>`;

  const textBody = [
    "פנייה חדשה מהאתר",
    `שם מלא: ${fullName}`,
    `אימייל: ${safeEmail}`,
    `טלפון: ${phone}`,
    `נושא: ${subject}`,
    "הודעה:",
    message,
  ].join("\n");

  const htmlBody = `
    <h2>פנייה חדשה מהאתר</h2>
    <p><strong>שם מלא:</strong> ${escapeHtml(fullName)}</p>
    <p><strong>אימייל:</strong> ${escapeHtml(safeEmail)}</p>
    <p><strong>טלפון:</strong> ${escapeHtml(phone)}</p>
    <p><strong>נושא:</strong> ${escapeHtml(subject)}</p>
    <p><strong>הודעה:</strong></p>
    <pre style="white-space:pre-wrap;font-family:inherit;">${escapeHtml(
      message
    )}</pre>
  `;

  try {
    await transporter.sendMail({
      from: fromAddress, // ממערכת
      to: toAddress, // יעד קבוע: ENV
      replyTo: `${fullName} <${safeEmail}>`, // השבה לפונה
      subject: `📩 פנייה חדשה - ${subject}`,
      text: textBody,
      html: htmlBody,
    });

    return res.json({ success: true, message: "הפנייה נשלחה בהצלחה" });
  } catch (err) {
    console.error("❌ sendContactForm:", err);
    return res.status(500).json({
      success: false,
      message: "שגיאה בשליחת הפנייה, נסה שוב מאוחר יותר",
    });
  }
}

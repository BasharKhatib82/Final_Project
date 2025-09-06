// backend\routes\contactRoutes.js
import express from "express";
import nodemailer from "nodemailer";
import { validateAndSanitizeEmail } from "../utils/validateAndSanitizeEmail.js";

const router = express.Router();

/**
 * פונקציית עזר: המרת ערך למספר (כולל ברירת מחדל)
 */
const toNumber = (v, fallback) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

/**
 * פונקציית עזר: הימנעות מהזרקות HTML
 */
const escapeHtml = (s = "") =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

/**
 * יצירת טרנספורטר SMTP
 * secure=true → לרוב פורט 465, אחרת 587 (STARTTLS)
 */
const smtpSecure = process.env.SMTP_SECURE === "true";
const smtpPort = toNumber(process.env.SMTP_PORT, smtpSecure ? 465 : 587);

// 🔹 יצירת טרנספורטר עם SMTP (משתמש בהגדרות שלך)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: smtpPort,
  secure: smtpSecure,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    // אם השרת משתמש בתעודה self-signed; אם יש תעודה תקינה – מומלץ להסיר
    rejectUnauthorized: false,
  },
});

/******************************************** /
//               שליחת טופס צור קשר          /
******************************************** */
/**
 * מה עושה: שולח פנייה מהאתר למייל הייעודי.
 * מה מקבל (Body): { fullName, email, phone, subject?, message }
 * מה מחזיר: { success, message }
 */
router.post("/", async (req, res) => {
  let { fullName, email, phone, subject, message } = req.body || {};

  fullName = (fullName || "").trim();
  phone = (phone || "").trim();
  subject = (subject || "פנייה מהאתר").trim();
  message = (message || "").trim();

  if (!fullName || !email || !phone || !message) {
    return res
      .status(400)
      .json({ success: false, message: "נא למלא את כל השדות החובה" });
  }

  // ✅ שימוש ב־validateAndSanitizeEmail: מחזיר מייל מסונן או זורק Error אם לא תקין
  let safeEmail;
  try {
    safeEmail = validateAndSanitizeEmail(email);
  } catch (e) {
    return res.status(400).json({
      success: false,
      message: e?.message || "כתובת דואר אלקטרוני לא חוקית",
    });
  }

  try {
    const fromAddress = `"Respondify CRM" <${process.env.SMTP_USER}>`;
    const toAddress = process.env.CONTACT_TO || "reports@respondify-crm.co.il";

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

    await transporter.sendMail({
      from: fromAddress, // מייל מערכת
      to: toAddress, // יעד
      replyTo: `${fullName} <${safeEmail}>`, // להשיב לפונה
      subject: `📩 פנייה חדשה מצור קשר - ${subject}`,
      text: textBody,
      html: htmlBody,
    });

    return res.json({ success: true, message: "הפנייה נשלחה בהצלחה" });
  } catch (err) {
    console.error("❌ שגיאה בשליחת מייל צור קשר:", err);
    return res.status(500).json({
      success: false,
      message: "שגיאה בשליחת הפנייה, נסה שוב מאוחר יותר",
    });
  }
});

export default router;

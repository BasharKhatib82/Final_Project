// backend\services\email.service.js

import nodemailer from "nodemailer";

/**
 * שליחת מייל עם קישור לאיפוס סיסמה
 * מקבל: כתובת אימייל וטוקן לאיפוס
 * מחזיר: שיגור מייל עם קישור ייחודי לאיפוס סיסמה (או שגיאה אם נכשלה השליחה)
 */
export async function sendResetPasswordEmail(email, token) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const resetLink = `${process.env.FRONTEND_URL}/reset-password/${token}`;

  await transporter.sendMail({
    from: `"מערכת CRM" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "איפוס סיסמה",
    html: `<p>לחץ על הלינק לאיפוס סיסמה:</p><a href="${resetLink}">${resetLink}</a>`,
  });
}

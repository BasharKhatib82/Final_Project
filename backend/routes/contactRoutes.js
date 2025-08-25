// routes/contactRoutes.js
import express from "express";
import nodemailer from "nodemailer";

const router = express.Router();

// 🔹 יצירת טרנספורטר עם SMTP (משתמש בהגדרות שלך)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ✅ שליחת טופס צור קשר
router.post("/", async (req, res) => {
  const { fullName, email, phone, subject, message } = req.body;

  if (!fullName || !email || !phone || !message) {
    return res
      .status(400)
      .json({ success: false, message: "נא למלא את כל השדות החובה" });
  }

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: "reports@resondify-crm.co.il", // כתובת היעד
      subject: `📩 פנייה חדשה מצור קשר - ${subject}`,
      html: `
        <h2>פנייה חדשה מהאתר</h2>
        <p><strong>שם מלא:</strong> ${fullName}</p>
        <p><strong>אימייל:</strong> ${email}</p>
        <p><strong>טלפון:</strong> ${phone}</p>
        <p><strong>נושא:</strong> ${subject}</p>
        <p><strong>הודעה:</strong></p>
        <p>${message}</p>
      `,
    });

    res.json({ success: true, message: "הפנייה נשלחה בהצלחה" });
  } catch (err) {
    console.error("❌ שגיאה בשליחת מייל צור קשר:", err);
    res.status(500).json({
      success: false,
      message: "שגיאה בשליחת הפנייה, נסה שוב מאוחר יותר",
    });
  }
});

export default router;

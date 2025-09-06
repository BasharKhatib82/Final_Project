// backend\routes\contactRoutes.js
import express from "express";
import nodemailer from "nodemailer";

const router = express.Router();

// 🔹 יצירת טרנספורטר עם SMTP (משתמש בהגדרות שלך)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 465,
  secure: process.env.SMTP_SECURE === "true", // true = פורט 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    // אם השרת משתמש בתעודה self-signed
    rejectUnauthorized: false,
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
      to: "reports@respondify-crm.co.il", // כתובת היעד
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

router.get("/test-mail", async (req, res) => {
  try {
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: "yourpersonal@email.com",
      subject: "בדיקת מייל 🚀",
      text: "שלום, זו הודעת בדיקה מ-CRM",
    });
    res.json({ success: true, message: "המייל נשלח בהצלחה" });
  } catch (err) {
    console.error("❌ בדיקת מייל נכשלה:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;

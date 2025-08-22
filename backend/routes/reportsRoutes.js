import express from "express";
import { sendReportEmail } from "../utils/reports.mailer.js";

const router = express.Router();

// ... שאר הראוטים של reports

// שליחת דוח למייל
router.post("/send-email", async (req, res) => {
  try {
    const { title, columns, rows, to, format } = req.body;
    if (!to)
      return res.status(400).json({ ok: false, error: "חסר יעד לשליחה" });

    await sendReportEmail({ title, columns, rows, to, format });
    res.json({ ok: true, message: "נשלח בהצלחה" });
  } catch (err) {
    console.error("❌ שגיאה בשליחת מייל:", err);
    res.status(500).json({ ok: false, error: "שליחה נכשלה" });
  }
});

export default router;

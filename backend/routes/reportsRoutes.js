// routes/reportsRoutes.js
import express from "express";
import { sendReportEmail } from "../utils/reports.mailer.js";

const router = express.Router();

// POST /reports/send-email
router.post("/send-email", async (req, res) => {
  try {
    const { title, columns, rows, to, format = "xlsx" } = req.body;
    if (!to)
      return res.status(400).json({ ok: false, error: "חסר יעד לשליחה" });

    await sendReportEmail({ title, columns, rows, to, format });
    res.json({ ok: true });
  } catch (err) {
    console.error("❌ send-email failed:", err);
    res.status(500).json({ ok: false, error: "שליחה נכשלה" });
  }
});

export default router;

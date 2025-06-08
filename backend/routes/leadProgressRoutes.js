import express from "express";
import dbSingleton from "../utils/dbSingleton.js";
import verifyToken from "../utils/verifyToken.js";
import logAction from "../utils/logAction.js";

const router = express.Router();
const connection = dbSingleton.getConnection();

// ✅ שליפת כל תיעוד ההתקדמות עבור פנייה מסוימת
router.get("/:lead_id", verifyToken, (req, res) => {
  const { lead_id } = req.params;

  const sql = `
    SELECT lp.*, CONCAT(u.first_name, ' ', u.last_name) AS user_name
    FROM lead_progress lp
    JOIN users u ON lp.user_id = u.user_id
    WHERE lp.lead_id = ?
    ORDER BY lp.update_time DESC
  `;

  connection.query(sql, [lead_id], (err, result) => {
    if (err) {
      console.error("שגיאה בשליפת התקדמות:", err);
      return res.json({ Status: false, Error: err });
    }

    res.json({ Status: true, Result: result });
  });
});

// ✅ הוספת תיעוד חדש להתקדמות פנייה
router.post("/add", verifyToken, (req, res) => {
  const { lead_id, lead_note, status } = req.body;
  const user_id = req.user.user_id;

  if (!lead_id || !lead_note || !status) {
    return res.json({ Status: false, Error: "נא למלא את כל השדות" });
  }

  const sql = `
    INSERT INTO lead_progress (lead_id, user_id, lead_note, status, update_time)
    VALUES (?, ?, ?, ?, NOW())
  `;

  connection.query(
    sql,
    [lead_id, user_id, lead_note, status],
    (err, result) => {
      if (err) {
        console.error("שגיאה בהוספת תיעוד:", err);
        return res.json({ Status: false, Error: err });
      }

      logAction(`הוספת תיעוד לפנייה #${lead_id}`)(req, res, () => {});
      res.json({ Status: true, Message: "תיעוד נשמר בהצלחה" });
    }
  );
});

export default router;

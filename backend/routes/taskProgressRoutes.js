import express from "express";
import { db } from "../utils/dbSingleton.js";
import verifyToken from "../utils/verifyToken.js";
import logAction from "../utils/logAction.js";

const router = express.Router();

// ✅ שליפת כל תיעוד ההתקדמות עבור משימה מסוימת
router.get("/:task_id", verifyToken, async (req, res) => {
  const { task_id } = req.params;

  const sql = `
    SELECT tp.*, CONCAT(u.first_name, ' ', u.last_name) AS user_name
    FROM task_progress tp
    JOIN users u ON tp.user_id = u.user_id
    WHERE tp.task_id = ?
    ORDER BY tp.update_time DESC
  `;

  try {
    const [result] = await db.query(sql, [task_id]);
    res.json({ Status: true, Result: result });
  } catch (err) {
    console.error("שגיאה בשליפת התקדמות משימה:", err);
    return res.json({ Status: false, Error: "שגיאה בשליפת התקדמות משימה" });
  }
});

// ✅ הוספת תיעוד חדש להתקדמות משימה + עדכון סטטוס במשימה
router.post("/add", verifyToken, async (req, res) => {
  const { task_id, progress_note, status } = req.body;
  const user_id = req.user.user_id;

  if (!task_id || !progress_note || !status) {
    return res.json({ Status: false, Error: "נא למלא את כל השדות" });
  }

  const insertProgressSQL = `
    INSERT INTO task_progress (task_id, user_id, progress_note, status, update_time)
    VALUES (?, ?, ?, ?, NOW())
  `;

  const updateTaskSQL = `
    UPDATE tasks
    SET status = ?
    WHERE task_id = ?
  `;

  try {
    // Start a transaction if needed, for simplicity we'll run two queries in sequence
    await db.query(insertProgressSQL, [
      task_id,
      user_id,
      progress_note,
      status,
    ]);
    await db.query(updateTaskSQL, [status, task_id]);

    await logAction(`הוספת תיעוד למשימה #${task_id} (סטטוס: ${status})`);

    res.json({ Status: true, Message: "התיעוד נשמר בהצלחה" });
  } catch (err) {
    console.error("שגיאה בהוספת תיעוד למשימה או בעדכון סטטוס:", err);
    return res.json({
      Status: false,
      Error: "שגיאה בשמירת התיעוד או בעדכון המשימה",
    });
  }
});

export default router;

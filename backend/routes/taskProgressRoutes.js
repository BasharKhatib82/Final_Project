import express from "express";
import { db } from "../utils/dbSingleton.js";
import verifyToken from "../utils/verifyToken.js";
import logAction from "../utils/logAction.js";

const router = express.Router();

// פונקציה אחידה לתגובות
const sendResponse = (
  res,
  success,
  data = null,
  message = null,
  status = 200
) => {
  res.status(status).json({ success, data, message });
};

// ✅ שליפת כל התיעוד למשימה
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
    const [rows] = await db.query(sql, [task_id]);
    sendResponse(res, true, rows);
  } catch (err) {
    console.error("❌ שגיאה בשליפת התקדמות משימה:", err);
    sendResponse(res, false, null, "שגיאה בשליפת התקדמות משימה", 500);
  }
});

// ✅ הוספת תיעוד חדש + עדכון סטטוס
router.post("/add", verifyToken, async (req, res) => {
  const { task_id, progress_note, status } = req.body;
  const user_id = req.user?.user_id;

  if (!task_id || !progress_note || !status) {
    return sendResponse(res, false, null, "נא למלא את כל השדות", 400);
  }

  // אפשר להוסיף ולידציה לערכים חוקיים של status
  const allowedStatuses = ["חדש", "בתהליך", "הושלם"];
  if (!allowedStatuses.includes(status)) {
    return sendResponse(res, false, null, "סטטוס לא חוקי", 400);
  }

  const insertProgressSQL = `
    INSERT INTO task_progress (task_id, user_id, progress_note, status, update_time)
    VALUES (?, ?, ?, ?, NOW())
  `;
  const updateTaskSQL = `UPDATE tasks SET status=? WHERE task_id=?`;

  const conn = await db.getConnection(); // ⚡ פתיחת חיבור לטרנזקציה
  try {
    await conn.beginTransaction();

    await conn.query(insertProgressSQL, [
      task_id,
      user_id,
      progress_note,
      status,
    ]);
    await conn.query(updateTaskSQL, [status, task_id]);

    await conn.commit();

    logAction(`הוספת תיעוד למשימה #${task_id} (סטטוס: ${status})`)(
      req,
      res,
      () => {}
    );
    sendResponse(res, true, null, "התיעוד והסטטוס נשמרו בהצלחה");
  } catch (err) {
    await conn.rollback();
    console.error("❌ שגיאה בהוספת תיעוד למשימה:", err);
    sendResponse(res, false, null, "שגיאה בשמירת התיעוד או בעדכון המשימה", 500);
  } finally {
    conn.release();
  }
});

export default router;

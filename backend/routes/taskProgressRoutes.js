import express from "express";
import dbSingleton from "../utils/dbSingleton.js";
import verifyToken from "../utils/verifyToken.js";
import logAction from "../utils/logAction.js";

const router = express.Router();
const connection = dbSingleton.getConnection();

// ✅ שליפת כל תיעוד ההתקדמות עבור משימה מסוימת
router.get("/:task_id", verifyToken, (req, res) => {
  const { task_id } = req.params;

  const sql = `
    SELECT tp.*, CONCAT(u.first_name, ' ', u.last_name) AS user_name
    FROM task_progress tp
    JOIN users u ON tp.user_id = u.user_id
    WHERE tp.task_id = ?
    ORDER BY tp.update_time DESC
  `;

  connection.query(sql, [task_id], (err, result) => {
    if (err) {
      console.error("שגיאה בשליפת התקדמות משימה:", err);
      return res.json({ Status: false, Error: err });
    }

    res.json({ Status: true, Result: result });
  });
});

// ✅ הוספת תיעוד חדש להתקדמות משימה + עדכון סטטוס במשימה
router.post("/add", verifyToken, (req, res) => {
  const { task_id, progress_note, status } = req.body;
  const user_id = req.user.user_id;

  if (!task_id || !progress_note || !status) {
    return res.json({ Status: false, Error: "נא למלא את כל השדות" });
  }

  const insertProgressSQL = `
    INSERT INTO task_progress (task_id, user_id, progress_note, status, update_time)
    VALUES (?, ?, ?, ?, NOW())
  `;

  connection.query(
    insertProgressSQL,
    [task_id, user_id, progress_note, status],
    (err, result) => {
      if (err) {
        console.error("שגיאה בהוספת תיעוד למשימה:", err);
        return res.json({ Status: false, Error: err });
      }

      // ✅ עדכון סטטוס בטבלת tasks
      const updateTaskSQL = `
        UPDATE tasks
        SET status = ?
        WHERE task_id = ?
      `;

      connection.query(updateTaskSQL, [status, task_id], (err2) => {
        if (err2) {
          console.error("שגיאה בעדכון סטטוס משימה:", err2);
          return res.json({ Status: false, Error: err2 });
        }

        logAction(`הוספת תיעוד למשימה #${task_id} (סטטוס: ${status})`)(
          req,
          res,
          () => {}
        );

        res.json({ Status: true, Message: "התיעוד נשמר בהצלחה" });
      });
    }
  );
});

export default router;

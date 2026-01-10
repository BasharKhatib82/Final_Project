// backend\controllers\taskProgress.controller.js

import { db } from "../utils/dbSingleton.js";
import logAction from "../utils/logAction.js";
import { isPositiveInt } from "../utils/fieldValidators.js";
import { isValidTaskStatus } from "../utils/tasksHelpers.js";

/**
 * שליפת כל התיעוד למשימה
 * מקבל: :task_id
 * מחזיר: { success, data: Progress[] }
 */
export async function listTaskProgress(req, res) {
  const { task_id } = req.params;

  if (!isPositiveInt(task_id)) {
    return res
      .status(400)
      .json({ success: false, message: "מזהה משימה לא תקין" });
  }

  const sql = `
    SELECT tp.*, CONCAT(u.first_name, ' ', u.last_name) AS user_name
    FROM task_progress tp
    JOIN users u ON tp.user_id = u.user_id
    WHERE tp.task_id = ?
    ORDER BY tp.update_time DESC
  `;

  try {
    const [rows] = await db.query(sql, [Number(task_id)]);
    return res.json({ success: true, data: rows });
  } catch (err) {
    console.error("listTaskProgress:", err);
    return res
      .status(500)
      .json({ success: false, message: "שגיאה בשליפת התקדמות משימה" });
  }
}

/**
 * הוספת תיעוד חדש + עדכון סטטוס משימה
 * מקבל: { task_id, progress_note, status } (JWT מה user_id )
 * מחזיר: { success, message }
 */
export async function addTaskProgress(req, res) {
  const user_id = req.user?.user_id;
  const rawTaskId = req.body?.task_id;
  const rawNote = req.body?.progress_note;
  const rawStatus = req.body?.status;

  if (!rawTaskId || !rawNote || !rawStatus) {
    return res
      .status(400)
      .json({ success: false, message: "נא למלא את כל השדות" });
  }
  if (!isPositiveInt(rawTaskId)) {
    return res
      .status(400)
      .json({ success: false, message: "מזהה משימה לא תקין" });
  }

  const task_id = Number(rawTaskId);
  const progress_note = String(rawNote).trim();
  const status = String(rawStatus).trim();

  if (!progress_note) {
    return res
      .status(400)
      .json({ success: false, message: "תיאור תיעוד נדרש" });
  }
  if (!isValidTaskStatus(status)) {
    return res.status(400).json({ success: false, message: "סטטוס לא חוקי" });
  }

  //  תיאור לאורך סביר
  const safeNote = progress_note.slice(0, 1000);

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // ודא שהמשימה קיימת
    const [taskRows] = await conn.query(
      `SELECT task_id FROM tasks WHERE task_id = ?`,
      [task_id]
    );
    if (taskRows.length === 0) {
      await conn.rollback();
      return res
        .status(404)
        .json({ success: false, message: "משימה לא נמצאה" });
    }

    // הכנסה לטבלת התקדמות
    const [insProgress] = await conn.query(
      `
        INSERT INTO task_progress (task_id, user_id, progress_note, status, update_time)
        VALUES (?, ?, ?, ?, NOW())
      `,
      [task_id, user_id || null, safeNote, status]
    );
    if (insProgress.affectedRows !== 1) {
      throw new Error("הוספת התיעוד נכשלה");
    }

    // עדכון סטטוס המשימה
    const [updTask] = await conn.query(
      `UPDATE tasks SET status = ? WHERE task_id = ?`,
      [status, task_id]
    );
    if (updTask.affectedRows === 0) {
      throw new Error("עדכון סטטוס המשימה נכשל");
    }

    await conn.commit();

    logAction(`הוספת תיעוד למשימה [ ${task_id} ] `, user_id)(
      req,
      res,
      () => {}
    );
    return res.json({ success: true, message: "התיעוד והסטטוס נשמרו בהצלחה" });
  } catch (err) {
    try {
      await conn.rollback();
    } catch (e) {
      console.error("rollback:", e);
    }
    console.error("addTaskProgress:", err);
    return res.status(500).json({
      success: false,
      message: "שגיאה בשמירת התיעוד או בעדכון המשימה",
    });
  } finally {
    try {
      conn.release();
    } catch (e) {
      console.error("release:", e);
    }
  }
}

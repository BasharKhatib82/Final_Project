// backend\controllers\tasks.controller.js

import { db } from "../utils/dbSingleton.js";
import logAction from "../utils/logAction.js";
import { isValidTaskStatus } from "../utils/tasksHelpers.js";
import { isNineDigitId, isPositiveInt } from "../utils/fieldValidators.js";
import { isValidDate } from "../utils/attendanceHelpers.js";

/**
 * שליפת כל המשימות
 * מקבל: —
 * מחזיר: { success, data: Task[] }
 */
export async function listTasks(_req, res) {
  const sql = `
    SELECT t.*, u.first_name AS assigned_to_first_name, u.last_name AS assigned_to_last_name
    FROM tasks t
    LEFT JOIN users u ON t.user_id = u.user_id
    ORDER BY t.task_id DESC
  `;
  try {
    const [rows] = await db.query(sql);
    const tasks = rows.map((t) => ({
      ...t,
      assigned_to_name: t.assigned_to_first_name
        ? `${t.assigned_to_first_name} ${t.assigned_to_last_name}`
        : "ללא",
    }));
    return res.json({ success: true, data: tasks });
  } catch (err) {
    console.error("listTasks:", err);
    return res
      .status(500)
      .json({ success: false, message: "שגיאה בשליפת משימות" });
  }
}

/**
 * הוספת משימה
 * מקבל: { task_title (חובה), description?, status(חוקי), due_date(חובה), user_id? }
 * מחזיר: { success, message }
 */
export async function addTask(req, res) {
  const task_title = String(req.body.task_title ?? "").trim();
  const description = req.body.description ?? null;
  const status = String(req.body.status ?? "").trim();
  const due_date = String(req.body.due_date ?? "").trim();
  const user_id =
    req.body.user_id != null ? String(req.body.user_id).trim() : null;

  if (!task_title || !due_date || !status) {
    return res
      .status(400)
      .json({ success: false, message: "נא למלא את כל שדות החובה" });
  }
  if (!isValidTaskStatus(status)) {
    return res
      .status(400)
      .json({ success: false, message: "סטטוס משימה לא חוקי" });
  }
  if (!isValidDate(due_date)) {
    return res
      .status(400)
      .json({ success: false, message: "תאריך יעד לא תקין" });
  }
  if (user_id && !isNineDigitId(user_id)) {
    return res
      .status(400)
      .json({
        success: false,
        message: "תעודת זהות חייבת להיות מספר בן 9 ספרות",
      });
  }

  try {
    await db.query(
      `INSERT INTO tasks (task_title, description, status, due_date, user_id)
       VALUES (?, ?, ?, ?, ?)`,
      [task_title, description || null, status, due_date, user_id || null]
    );

    logAction("הוספת משימה חדשה", req.user?.user_id)(req, res, () => {});
    return res.json({ success: true, message: "המשימה נוספה בהצלחה" });
  } catch (err) {
    console.error("addTask:", err);
    return res
      .status(500)
      .json({ success: false, message: "שגיאה בהוספת משימה" });
  }
}

/**
 * עדכון משימה
 * מקבל: :id, { task_title (חובה), description?, status(חוקי), due_date(חובה), user_id? }
 * מחזיר: { success, message }
 */
export async function updateTask(req, res) {
  const { id } = req.params;
  const task_title = String(req.body.task_title ?? "").trim();
  const description = req.body.description ?? null;
  const status = String(req.body.status ?? "").trim();
  const due_date = String(req.body.due_date ?? "").trim();
  const user_id =
    req.body.user_id != null ? String(req.body.user_id).trim() : null;

  if (!isPositiveInt(id)) {
    return res
      .status(400)
      .json({ success: false, message: "מזהה משימה לא תקין" });
  }
  if (!task_title || !due_date || !status) {
    return res
      .status(400)
      .json({ success: false, message: "נא למלא את כל שדות החובה" });
  }
  if (!isValidTaskStatus(status)) {
    return res
      .status(400)
      .json({ success: false, message: "סטטוס משימה לא חוקי" });
  }
  if (!isValidDate(due_date)) {
    return res
      .status(400)
      .json({ success: false, message: "תאריך יעד לא תקין" });
  }
  if (user_id && !isNineDigitId(user_id)) {
    return res
      .status(400)
      .json({
        success: false,
        message: "תעודת זהות חייבת להיות מספר בן 9 ספרות",
      });
  }

  try {
    const [result] = await db.query(
      `UPDATE tasks
       SET task_title=?, description=?, status=?, due_date=?, user_id=?
       WHERE task_id=?`,
      [
        task_title,
        description || null,
        status,
        due_date,
        user_id || null,
        Number(id),
      ]
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "משימה לא נמצאה" });
    }

    logAction(`עדכון משימה #${id}`, req.user?.user_id)(req, res, () => {});
    return res.json({ success: true, message: "המשימה עודכנה בהצלחה" });
  } catch (err) {
    console.error("updateTask:", err);
    return res
      .status(500)
      .json({ success: false, message: "שגיאה בעריכת משימה" });
  }
}

/**
 * מחיקה לוגית (סימון 'בוטלה')
 * מקבל: :id
 * מחזיר: { success, message }
 */
export async function cancelTask(req, res) {
  const { id } = req.params;

  if (!isPositiveInt(id)) {
    return res
      .status(400)
      .json({ success: false, message: "מזהה משימה לא תקין" });
  }

  try {
    const [result] = await db.query(
      "UPDATE tasks SET status='בוטלה' WHERE task_id=?",
      [Number(id)]
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "משימה לא נמצאה" });
    }

    logAction(`ביטול משימה #${id}`, req.user?.user_id)(req, res, () => {});
    return res.json({ success: true, message: "המשימה בוטלה בהצלחה" });
  } catch (err) {
    console.error("cancelTask:", err);
    return res
      .status(500)
      .json({ success: false, message: "שגיאה בביטול משימה" });
  }
}

/**
 * שיוך מרוכז של משימות לנציג
 * מקבל: { taskIds:number[], user_id?[9 ספרות] } – null מסיר שיוך
 * מחזיר: { success, message }
 */
export async function bulkAssignTasks(req, res) {
  const { taskIds, user_id } = req.body;

  if (!Array.isArray(taskIds) || taskIds.length === 0) {
    return res.status(400).json({ success: false, message: "יש לבחור משימות" });
  }

  const repUserId = user_id != null ? String(user_id).trim() : null;
  if (repUserId && !isNineDigitId(repUserId)) {
    return res
      .status(400)
      .json({
        success: false,
        message: "תעודת זהות חייבת להיות מספר בן 9 ספרות",
      });
  }

  try {
    const [result] = await db.query(
      `UPDATE tasks SET user_id=? WHERE task_id IN (?)`,
      [repUserId || null, taskIds]
    );

    logAction(`שיוך מרובה למשימות (${taskIds.length})`, req.user?.user_id)(
      req,
      res,
      () => {}
    );
    return res.json({
      success: true,
      message: "שיוך מרובה עודכן בהצלחה",
      data: { affected: result?.affectedRows ?? 0 },
    });
  } catch (err) {
    console.error("bulkAssignTasks:", err);
    return res
      .status(500)
      .json({ success: false, message: "שגיאה בשיוך מרובה" });
  }
}

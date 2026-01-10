// backend\controllers\tasks.controller.js

import { db } from "../utils/dbSingleton.js";
import logAction from "../utils/logAction.js";
import { isValidTaskStatus } from "../utils/tasksHelpers.js";
import { isValidDate } from "../utils/attendanceHelpers.js";
import getUserFullName from "../utils/getUserFullName.js";

/**
 * data_scope שליפת משימות עם תמיכה ב־
 * ----------------------------------
 * (req.user) מקבל : משתמש מחובר
 *   - data_scope_all = 1 → מחזיר את כל המשימות.
 *   - data_scope_self = 1 → מחזיר רק את המשימות של המשתמש עצמו.
 *
 * מחזיר: { success, data: Task[] }
 */

export async function listTasks(req, res) {
  const user = req.user;

  let where = "";
  if (user?.data_scope_self === 1 && user?.data_scope_all !== 1) {
    where = `WHERE t.user_id = ${db.escape(user.user_id)}`;
  }

  const sql = `
    SELECT 
      t.*, 
      u.first_name AS assigned_to_first_name, 
      u.last_name AS assigned_to_last_name
    FROM tasks t
    LEFT JOIN users u ON t.user_id = u.user_id
    ${where}
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
 * ID שליפת משימה לפי
 * מקבל: :id
 * מחזיר: אובייקט משימה עם פרטי נציג (אם יש)
 */
export async function getTaskById(req, res) {
  const sql = `
    SELECT 
      t.*,
      u.first_name AS assigned_first_name,
      u.last_name AS assigned_last_name,
      u.user_id AS assigned_user_id
    FROM tasks t
    LEFT JOIN users u ON t.user_id = u.user_id
    WHERE t.task_id = ?
  `;

  try {
    const [rows] = await db.query(sql, [req.params.id]);

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "משימה לא נמצאה" });
    }

    return res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error("getTaskById:", err);
    return res.status(500).json({ success: false, message: "שגיאה בשרת" });
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

  try {
    await db.query(
      `INSERT INTO tasks (task_title, description, status, due_date, user_id)
       VALUES (?, ?, ?, ?, ?)`,
      [task_title, description || null, status, due_date, user_id || null]
    );

    let fullName = null;
    if (user_id) {
      fullName = await getUserFullName(user_id);
    }

    const targetLabel = fullName || "ללא נציג";

    logAction(`הוספת משימה חדשה עבור : ${targetLabel}`, req.user?.user_id)(
      req,
      res,
      () => {}
    );

    return res.json({ success: true, message: "המשימה נוספה בהצלחה" });
  } catch (err) {
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

  if (!task_title || !due_date) {
    return res
      .status(400)
      .json({ success: false, message: "נא למלא את כל שדות החובה" });
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

    logAction(`עדכון משימה מספר [ ${id} ] `, req.user?.user_id)(
      req,
      res,
      () => {}
    );
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

    logAction(`ביטול משימה מספר [ ${id} ] `, req.user?.user_id)(
      req,
      res,
      () => {}
    );
    return res.json({ success: true, message: "המשימה בוטלה בהצלחה" });
  } catch (err) {
    console.error("cancelTask:", err);
    return res
      .status(500)
      .json({ success: false, message: "שגיאה בביטול משימה" });
  }
}

/**
 * עדכון נציג למשימה
 * מקבל: :id, { user_id }
 */
export async function updateTaskRep(req, res) {
  const taskId = req.params.id;
  const repUserId =
    req.body.user_id != null ? String(req.body.user_id).trim() : null;

  try {
    const [result] = await db.query(
      "UPDATE tasks SET user_id = ? WHERE task_id = ?",
      [repUserId || null, taskId]
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "משימה לא נמצאה" });
    }

    logAction(`עדכון נציג למשימה [ ${taskId} ]`, req.user.user_id)(
      req,
      res,
      () => {}
    );

    return res.json({ success: true, message: "נציג עודכן בהצלחה" });
  } catch (err) {
    console.error("updateTaskRep:", err);
    return res.status(500).json({ success: false, message: "שגיאה בשרת" });
  }
}

/**
 * עדכון סטטוס למשימה
 * מקבל: :id, { status }
 */
export async function updateTaskStatus(req, res) {
  const taskId = req.params.id;
  const newStatus = String(req.body.status ?? "").trim();

  if (!isValidTaskStatus(newStatus)) {
    return res
      .status(400)
      .json({ success: false, message: "סטטוס משימה לא חוקי" });
  }

  try {
    const [result] = await db.query(
      "UPDATE tasks SET status = ? WHERE task_id = ?",
      [newStatus, taskId]
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "משימה לא נמצאה" });
    }

    logAction(`עדכון סטטוס למשימה [ ${taskId} ]`, req.user.user_id)(
      req,
      res,
      () => {}
    );

    return res.json({ success: true, message: "סטטוס עודכן בהצלחה" });
  } catch (err) {
    console.error("updateTaskStatus:", err);
    return res.status(500).json({ success: false, message: "שגיאה בשרת" });
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

  try {
    const [result] = await db.query(
      `UPDATE tasks SET user_id=? WHERE task_id IN (?)`,
      [repUserId || null, taskIds]
    );

    const fullName = await getUserFullName(user_id);
    logAction(
      `שיוך (${taskIds.length}) משימות עבור : ${fullName}`,
      req.user?.user_id
    )(req, res, () => {});
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

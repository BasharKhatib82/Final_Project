import express from "express";
import { db } from "../utils/dbSingleton.js";
import verifyToken from "../utils/verifyToken.js";
import logAction from "../utils/logAction.js";

const router = express.Router();

// ✅ שליפת כל המשימות
router.get("/", verifyToken, async (req, res) => {
  const sql = `
    SELECT 
      t.*, 
      u.first_name AS assigned_to_first_name, 
      u.last_name AS assigned_to_last_name
    FROM tasks t
    LEFT JOIN users u ON t.user_id = u.user_id
    ORDER BY t.task_id DESC
  `;

  try {
    const [result] = await db.query(sql);
    const tasks = result.map((task) => ({
      ...task,
      assigned_to_name: task.assigned_to_first_name
        ? `${task.assigned_to_first_name} ${task.assigned_to_last_name}`
        : "ללא",
    }));
    res.json({ Status: true, Result: tasks });
  } catch (err) {
    console.error("שגיאה בשליפת כל המשימות:", err);
    return res.json({ Status: false, Error: "שגיאה בשליפת המשימות" });
  }
});

// ✅ הוספת משימה
router.post("/add", verifyToken, async (req, res) => {
  const { task_title, description, status, due_date, user_id } = req.body;

  if (!task_title || !due_date || !status) {
    return res.json({ Status: false, Error: "נא למלא את כל השדות החובה" });
  }

  const sql = `
    INSERT INTO tasks (task_title, description, status, due_date, user_id)
    VALUES (?, ?, ?, ?, ?)
  `;

  try {
    await db.query(sql, [
      task_title,
      description,
      status,
      due_date,
      user_id || null,
    ]);
    await logAction(`הוספת משימה חדשה`);
    res.json({ Status: true, Message: "המשימה נוספה בהצלחה" });
  } catch (err) {
    console.error("שגיאה בהוספת משימה:", err);
    return res.json({ Status: false, Error: "שגיאה בהוספת משימה" });
  }
});

// ✅ עריכת משימה
router.put("/edit/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  const { task_title, description, status, due_date, user_id } = req.body;

  if (!task_title || !due_date || !status) {
    return res.json({ Status: false, Error: "נא למלא את כל השדות החובה" });
  }

  const sql = `
    UPDATE tasks
    SET task_title = ?, description = ?, status = ?, due_date = ?, user_id = ?
    WHERE task_id = ?
  `;

  try {
    await db.query(sql, [
      task_title,
      description,
      status,
      due_date,
      user_id || null,
      id,
    ]);
    await logAction(`עדכון משימה #${id}`);
    res.json({ Status: true, Message: "המשימה עודכנה בהצלחה" });
  } catch (err) {
    console.error("שגיאה בעריכת משימה:", err);
    return res.json({ Status: false, Error: "שגיאה בעריכת משימה" });
  }
});

// ✅ מחיקה לוגית (ביטול משימה)
router.delete("/delete/:id", verifyToken, async (req, res) => {
  const { id } = req.params;

  const sql = `
    UPDATE tasks
    SET status = 'בוטלה'
    WHERE task_id = ?
  `;

  try {
    await db.query(sql, [id]);
    await logAction(`ביטול משימה #${id}`);
    res.json({ Status: true, Message: "המשימה בוטלה בהצלחה" });
  } catch (err) {
    console.error("שגיאה במחיקת משימה:", err);
    return res.json({ Status: false, Error: "שגיאה במחיקת משימה" });
  }
});

// ✅ עדכון סטטוס משימה
router.put("/update-status/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.json({ Status: false, Error: "יש לבחור סטטוס" });
  }

  const sql = `
    UPDATE tasks
    SET status = ?
    WHERE task_id = ?
  `;

  try {
    await db.query(sql, [status, id]);
    await logAction(`עדכון סטטוס למשימה #${id}`);
    res.json({ Status: true, Message: "סטטוס עודכן בהצלחה" });
  } catch (err) {
    console.error("שגיאה בעדכון סטטוס משימה:", err);
    return res.json({ Status: false, Error: "שגיאה בעדכון סטטוס משימה" });
  }
});

// ✅ עדכון נציג מטפל
router.put("/update-rep/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  const { user_id } = req.body;

  const sql = `
    UPDATE tasks
    SET user_id = ?
    WHERE task_id = ?
  `;

  try {
    await db.query(sql, [user_id || null, id]);
    await logAction(`עדכון נציג למשימה #${id}`);
    res.json({ Status: true, Message: "נציג עודכן בהצלחה" });
  } catch (err) {
    console.error("שגיאה בעדכון נציג מטפל:", err);
    return res.json({ Status: false, Error: "שגיאה בעדכון נציג" });
  }
});

// ✅ שיוך מרובה (bulk assign)
router.put("/bulk-assign", verifyToken, async (req, res) => {
  const { taskIds, user_id } = req.body;

  if (!Array.isArray(taskIds) || taskIds.length === 0) {
    return res.json({ Status: false, Error: "יש לבחור משימות" });
  }

  const sql = `
    UPDATE tasks
    SET user_id = ?
    WHERE task_id IN (?)
  `;

  try {
    await db.query(sql, [user_id || null, taskIds]);
    await logAction(`שיוך מרובה למשימות [${taskIds.join(", ")}]`);
    res.json({ Status: true, Message: "שיוך מרובה עודכן בהצלחה" });
  } catch (err) {
    console.error("שגיאה בשיוך מרובה:", err);
    return res.json({ Status: false, Error: "שגיאה בשיוך מרובה" });
  }
});

// ✅ שליפת משימה בודדת
router.get("/:id", verifyToken, async (req, res) => {
  const { id } = req.params;

  const sql = `
    SELECT t.*, u.first_name AS assigned_to_first_name, u.last_name AS assigned_to_last_name
    FROM tasks t
    LEFT JOIN users u ON t.user_id = u.user_id
    WHERE t.task_id = ?
  `;

  try {
    const [result] = await db.query(sql, [id]);

    if (result.length === 0) {
      return res.json({ Status: false, Error: "המשימה לא נמצאה" });
    }

    const task = result[0];
    task.assigned_to_name = task.assigned_to_first_name
      ? `${task.assigned_to_first_name} ${task.assigned_to_last_name}`
      : "ללא";

    res.json({ Status: true, Result: task });
  } catch (err) {
    console.error("שגיאה בשליפת משימה בודדת:", err);
    return res.json({ Status: false, Error: "שגיאה בשליפת המשימה" });
  }
});

export default router;

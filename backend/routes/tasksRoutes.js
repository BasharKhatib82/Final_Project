import express from "express";
import { db } from "../utils/dbSingleton.js";
import verifyToken from "../utils/verifyToken.js";
import logAction from "../utils/logAction.js";

const router = express.Router();

// ✅ פונקציית תגובה אחידה
const sendResponse = (
  res,
  success,
  data = null,
  message = null,
  status = 200
) => {
  res.status(status).json({ success, data, message });
};

// ✅ שליפת כל המשימות
router.get("/", verifyToken, async (req, res) => {
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
    sendResponse(res, true, tasks);
  } catch (err) {
    console.error("❌ שגיאה בשליפת משימות:", err);
    sendResponse(res, false, null, "שגיאה בשליפת המשימות", 500);
  }
});

// ✅ הוספת משימה
router.post("/add", verifyToken, async (req, res) => {
  const { task_title, description, status, due_date, user_id } = req.body;
  if (!task_title || !due_date || !status) {
    return sendResponse(res, false, null, "נא למלא את כל השדות החובה", 400);
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
    logAction("הוספת משימה חדשה")(req, res, () => {});
    sendResponse(res, true, null, "המשימה נוספה בהצלחה");
  } catch (err) {
    console.error("❌ שגיאה בהוספת משימה:", err);
    sendResponse(res, false, null, "שגיאה בהוספת משימה", 500);
  }
});

// ✅ עריכת משימה
router.put("/edit/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  const { task_title, description, status, due_date, user_id } = req.body;
  if (!task_title || !due_date || !status) {
    return sendResponse(res, false, null, "נא למלא את כל השדות החובה", 400);
  }
  const sql = `
    UPDATE tasks
    SET task_title=?, description=?, status=?, due_date=?, user_id=?
    WHERE task_id=?
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
    logAction(`עדכון משימה #${id}`)(req, res, () => {});
    sendResponse(res, true, null, "המשימה עודכנה בהצלחה");
  } catch (err) {
    console.error("❌ שגיאה בעריכת משימה:", err);
    sendResponse(res, false, null, "שגיאה בעריכת משימה", 500);
  }
});

// ✅ מחיקה לוגית
router.delete("/delete/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  try {
    await db.query("UPDATE tasks SET status='בוטלה' WHERE task_id=?", [id]);
    logAction(`ביטול משימה #${id}`)(req, res, () => {});
    sendResponse(res, true, null, "המשימה בוטלה בהצלחה");
  } catch (err) {
    console.error("❌ שגיאה במחיקת משימה:", err);
    sendResponse(res, false, null, "שגיאה במחיקת משימה", 500);
  }
});

// ✅ bulk assign
router.put("/bulk-assign", verifyToken, async (req, res) => {
  const { taskIds, user_id } = req.body;
  if (!Array.isArray(taskIds) || taskIds.length === 0) {
    return sendResponse(res, false, null, "יש לבחור משימות", 400);
  }
  const placeholders = taskIds.map(() => "?").join(",");
  const sql = `UPDATE tasks SET user_id=? WHERE task_id IN (${placeholders})`;
  try {
    await db.query(sql, [user_id || null, ...taskIds]);
    logAction(`שיוך מרובה למשימות [${taskIds.join(", ")}]`)(req, res, () => {});
    sendResponse(res, true, null, "שיוך מרובה עודכן בהצלחה");
  } catch (err) {
    console.error("❌ שגיאה בשיוך מרובה:", err);
    sendResponse(res, false, null, "שגיאה בשיוך מרובה", 500);
  }
});

export default router;

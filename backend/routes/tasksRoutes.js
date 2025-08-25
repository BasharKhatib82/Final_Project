import express from "express";
import { db } from "../utils/dbSingleton.js";
import verifyToken from "../utils/verifyToken.js";
import logAction from "../utils/logAction.js";

const router = express.Router();

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
    res.json({ success: true, data: tasks });
  } catch (err) {
    console.error("❌ שגיאה בשליפת משימות:", err);
    res.status(500).json({ success: false, message: "שגיאה בשליפת משימות" });
  }
});

// ✅ הוספת משימה
router.post("/add", verifyToken, async (req, res) => {
  const { task_title, description, status, due_date, user_id } = req.body;
  if (!task_title || !due_date || !status) {
    return res
      .status(400)
      .json({ success: false, message: "נא למלא את כל שדות החובה" });
  }
  try {
    await db.query(
      `INSERT INTO tasks (task_title, description, status, due_date, user_id) VALUES (?, ?, ?, ?, ?)`,
      [task_title, description, status, due_date, user_id || null]
    );
    logAction("הוספת משימה חדשה")(req, res, () => {});
    res.json({ success: true, message: "המשימה נוספה בהצלחה" });
  } catch (err) {
    console.error("❌ שגיאה בהוספת משימה:", err);
    res.status(500).json({ success: false, message: "שגיאה בהוספת משימה" });
  }
});

// ✅ עדכון משימה
router.put("/edit/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  const { task_title, description, status, due_date, user_id } = req.body;
  if (!task_title || !due_date || !status) {
    return res
      .status(400)
      .json({ success: false, message: "נא למלא את כל שדות החובה" });
  }
  try {
    await db.query(
      `UPDATE tasks SET task_title=?, description=?, status=?, due_date=?, user_id=? WHERE task_id=?`,
      [task_title, description, status, due_date, user_id || null, id]
    );
    logAction(`עדכון משימה #${id}`)(req, res, () => {});
    res.json({ success: true, message: "המשימה עודכנה בהצלחה" });
  } catch (err) {
    console.error("❌ שגיאה בעריכת משימה:", err);
    res.status(500).json({ success: false, message: "שגיאה בעריכת משימה" });
  }
});

// ✅ מחיקה לוגית
router.delete("/delete/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  try {
    await db.query("UPDATE tasks SET status='בוטלה' WHERE task_id=?", [id]);
    logAction(`ביטול משימה #${id}`)(req, res, () => {});
    res.json({ success: true, message: "המשימה בוטלה בהצלחה" });
  } catch (err) {
    console.error("❌ שגיאה בביטול משימה:", err);
    res.status(500).json({ success: false, message: "שגיאה בביטול משימה" });
  }
});

// ✅ שיוך מרובה
router.put("/bulk-assign", verifyToken, async (req, res) => {
  const { taskIds, user_id } = req.body;
  if (!Array.isArray(taskIds) || taskIds.length === 0) {
    return res.status(400).json({ success: false, message: "יש לבחור משימות" });
  }
  const placeholders = taskIds.map(() => "?").join(",");
  try {
    await db.query(
      `UPDATE tasks SET user_id=? WHERE task_id IN (${placeholders})`,
      [user_id || null, ...taskIds]
    );
    logAction(`שיוך מרובה למשימות [${taskIds.join(", ")}]`)(req, res, () => {});
    res.json({ success: true, message: "שיוך מרובה עודכן בהצלחה" });
  } catch (err) {
    console.error("❌ שגיאה בשיוך מרובה:", err);
    res.status(500).json({ success: false, message: "שגיאה בשיוך מרובה" });
  }
});

export default router;

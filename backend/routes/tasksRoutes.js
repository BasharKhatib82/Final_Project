import express from "express";
import dbSingleton from "../utils/dbSingleton.js";
import verifyToken from "../utils/verifyToken.js";
import logAction from "../utils/logAction.js";

const router = express.Router();
const connection = dbSingleton.getConnection();

// ✅ שליפת כל המשימות
router.get("/", verifyToken, (req, res) => {
  const sql = `
    SELECT 
      t.*, 
      u.first_name AS assigned_to_first_name, 
      u.last_name AS assigned_to_last_name
    FROM tasks t
    LEFT JOIN users u ON t.user_id = u.user_id
    ORDER BY t.task_id DESC
  `;

  connection.query(sql, (err, result) => {
    if (err) return res.json({ Status: false, Error: err });

    const tasks = result.map((task) => ({
      ...task,
      assigned_to_name: task.assigned_to_first_name
        ? `${task.assigned_to_first_name} ${task.assigned_to_last_name}`
        : "ללא",
    }));

    res.json({ Status: true, Result: tasks });
  });
});

// ✅ הוספת משימה
router.post("/add", verifyToken, (req, res) => {
  const { task_title, description, status, due_date, user_id } = req.body;

  if (!task_title || !due_date || !status) {
    return res.json({ Status: false, Error: "נא למלא את כל השדות החובה" });
  }

  const sql = `
    INSERT INTO tasks (task_title, description, status, due_date, user_id)
    VALUES (?, ?, ?, ?, ?)
  `;

  connection.query(
    sql,
    [task_title, description, status, due_date, user_id || null],
    (err) => {
      if (err) return res.json({ Status: false, Error: err });

      logAction(`הוספת משימה חדשה`)(req, res, () => {});
      res.json({ Status: true, Message: "המשימה נוספה בהצלחה" });
    }
  );
});

// ✅ עריכת משימה
router.put("/edit/:id", verifyToken, (req, res) => {
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

  connection.query(
    sql,
    [task_title, description, status, due_date, user_id || null, id],
    (err) => {
      if (err) return res.json({ Status: false, Error: err });

      logAction(`עדכון משימה #${id}`)(req, res, () => {});
      res.json({ Status: true, Message: "המשימה עודכנה בהצלחה" });
    }
  );
});

// ✅ מחיקה לוגית (ביטול משימה)
router.delete("/delete/:id", verifyToken, (req, res) => {
  const { id } = req.params;

  const sql = `
    UPDATE tasks
    SET status = 'בוטלה'
    WHERE task_id = ?
  `;

  connection.query(sql, [id], (err) => {
    if (err) return res.json({ Status: false, Error: err });

    logAction(`ביטול משימה #${id}`)(req, res, () => {});
    res.json({ Status: true, Message: "המשימה בוטלה בהצלחה" });
  });
});

// ✅ עדכון סטטוס משימה
router.put("/update-status/:id", verifyToken, (req, res) => {
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

  connection.query(sql, [status, id], (err) => {
    if (err) return res.json({ Status: false, Error: err });

    logAction(`עדכון סטטוס למשימה #${id}`)(req, res, () => {});
    res.json({ Status: true, Message: "סטטוס עודכן בהצלחה" });
  });
});

// ✅ עדכון נציג מטפל
router.put("/update-rep/:id", verifyToken, (req, res) => {
  const { id } = req.params;
  const { user_id } = req.body;

  const sql = `
    UPDATE tasks
    SET user_id = ?
    WHERE task_id = ?
  `;

  connection.query(sql, [user_id || null, id], (err) => {
    if (err) return res.json({ Status: false, Error: err });

    logAction(`עדכון נציג למשימה #${id}`)(req, res, () => {});
    res.json({ Status: true, Message: "נציג עודכן בהצלחה" });
  });
});

// ✅ שיוך מרובה (bulk assign)
router.put("/bulk-assign", verifyToken, (req, res) => {
  const { taskIds, user_id } = req.body;

  if (!Array.isArray(taskIds) || taskIds.length === 0) {
    return res.json({ Status: false, Error: "יש לבחור משימות" });
  }

  const sql = `
    UPDATE tasks
    SET user_id = ?
    WHERE task_id IN (?)
  `;

  connection.query(sql, [user_id || null, taskIds], (err) => {
    if (err) return res.json({ Status: false, Error: err });

    logAction(`שיוך מרובה למשימות [${taskIds.join(", ")}]`)(req, res, () => {});
    res.json({ Status: true, Message: "שיוך מרובה עודכן בהצלחה" });
  });
});

// ✅ שליפת משימה בודדת
router.get("/:id", verifyToken, (req, res) => {
  const { id } = req.params;

  const sql = `
    SELECT t.*, u.first_name AS assigned_to_first_name, u.last_name AS assigned_to_last_name
    FROM tasks t
    LEFT JOIN users u ON t.user_id = u.user_id
    WHERE t.task_id = ?
  `;

  connection.query(sql, [id], (err, result) => {
    if (err) return res.json({ Status: false, Error: err });

    if (result.length === 0) {
      return res.json({ Status: false, Error: "המשימה לא נמצאה" });
    }

    const task = result[0];
    task.assigned_to_name = task.assigned_to_first_name
      ? `${task.assigned_to_first_name} ${task.assigned_to_last_name}`
      : "ללא";

    res.json({ Status: true, Result: task });
  });
});

export default router;

import express from "express";
import { db } from "../utils/dbSingleton.js";
import verifyToken from "../utils/verifyToken.js";
import logAction from "../utils/logAction.js";

const router = express.Router();

// פונקציית עזר לאחידות תגובה
const sendResponse = (
  res,
  success,
  data = null,
  message = null,
  status = 200
) => {
  res.status(status).json({ success, data, message });
};

// ✅ שליפת כל הפרויקטים
router.get("/", verifyToken, async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM projects ORDER BY project_id DESC"
    );
    sendResponse(res, true, rows);
  } catch (err) {
    console.error("❌ שגיאה בשליפת פרויקטים:", err);
    sendResponse(res, false, null, "שגיאה בשליפת פרויקטים", 500);
  }
});

// ✅ הוספת פרויקט חדש
router.post("/add", verifyToken, async (req, res) => {
  const { project_name, project_description, is_active } = req.body;
  if (!project_name?.trim()) {
    return sendResponse(res, false, null, "יש להזין שם פרויקט", 400);
  }

  try {
    const [result] = await db.query(
      `INSERT INTO projects (project_name, project_description, is_active) VALUES (?, ?, ?)`,
      [project_name.trim(), project_description || null, is_active ?? 1]
    );

    logAction(`הוספת פרויקט חדש: ${project_name}`)(req, res, () => {});
    sendResponse(
      res,
      true,
      { project_id: result.insertId },
      "הפרויקט נוסף בהצלחה"
    );
  } catch (err) {
    console.error("❌ שגיאה בהוספת פרויקט:", err);
    sendResponse(res, false, null, "שגיאה בהוספת פרויקט", 500);
  }
});

// ✅ עדכון פרויקט קיים
router.put("/edit/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  const { project_name, project_description, is_active } = req.body;

  if (!project_name?.trim()) {
    return sendResponse(res, false, null, "יש להזין שם פרויקט", 400);
  }

  try {
    const [result] = await db.query(
      `UPDATE projects SET project_name=?, project_description=?, is_active=? WHERE project_id=?`,
      [project_name.trim(), project_description || null, is_active ?? 1, id]
    );

    if (result.affectedRows === 0) {
      return sendResponse(res, false, null, "פרויקט לא נמצא", 404);
    }

    logAction(`עדכון פרויקט #${id}`)(req, res, () => {});
    sendResponse(res, true, null, "הפרויקט עודכן בהצלחה");
  } catch (err) {
    console.error("❌ שגיאה בעדכון פרויקט:", err);
    sendResponse(res, false, null, "שגיאה בעדכון פרויקט", 500);
  }
});

// ✅ מחיקה לוגית של פרויקט
router.delete("/delete/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await db.query(
      `UPDATE projects SET is_active=0 WHERE project_id=?`,
      [id]
    );

    if (result.affectedRows === 0) {
      return sendResponse(res, false, null, "פרויקט לא נמצא", 404);
    }

    logAction(`מחיקת פרויקט #${id} (לוגית)`)(req, res, () => {});
    sendResponse(res, true, null, "הפרויקט הועבר לארכיון");
  } catch (err) {
    console.error("❌ שגיאה במחיקת פרויקט:", err);
    sendResponse(res, false, null, "שגיאה במחיקת פרויקט", 500);
  }
});

// ✅ שליפת פרויקטים לפי סטטוס (פעילים/לא פעילים)
router.get("/status/:active", verifyToken, async (req, res) => {
  const { active } = req.params;
  const isActive = active === "1" ? 1 : 0;

  try {
    const [rows] = await db.query(`SELECT * FROM projects WHERE is_active=?`, [
      isActive,
    ]);
    sendResponse(res, true, rows);
  } catch (err) {
    console.error("❌ שגיאה בשליפת פרויקטים:", err);
    sendResponse(res, false, null, "שגיאה בשליפת פרויקטים", 500);
  }
});

// ✅ שליפת פרויקט לפי ID
router.get("/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query(`SELECT * FROM projects WHERE project_id=?`, [
      id,
    ]);

    if (rows.length === 0) {
      return sendResponse(res, false, null, "הפרויקט לא נמצא", 404);
    }

    sendResponse(res, true, rows[0]);
  } catch (err) {
    console.error("❌ שגיאה בשליפת פרויקט:", err);
    sendResponse(res, false, null, "שגיאה בשליפת פרויקט", 500);
  }
});

export default router;

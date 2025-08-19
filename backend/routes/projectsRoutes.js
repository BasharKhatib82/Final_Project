import express from "express";
import { db } from "../utils/dbSingleton.js";
import verifyToken from "../utils/verifyToken.js";
import logAction from "../utils/logAction.js";

const router = express.Router();

// ✅ שליפת כל הפרויקטים
router.get("/", verifyToken, async (req, res) => {
  const sql = "SELECT * FROM projects ORDER BY project_id DESC";
  try {
    const [result] = await db.query(sql);
    res.json({ Status: true, Result: result });
  } catch (err) {
    console.error("שגיאה בשליפת פרויקטים:", err);
    return res.json({ Status: false, Error: "שגיאה בשליפת פרויקטים" });
  }
});

// ✅ הוספת פרויקט חדש
router.post("/add", verifyToken, async (req, res) => {
  const { project_name, project_description, is_active } = req.body;

  if (!project_name || project_name.trim() === "") {
    return res.json({ Status: false, Error: "יש להזין שם פרויקט" });
  }

  const sql = `
    INSERT INTO projects (project_name, project_description, is_active)
    VALUES (?, ?, ?)
  `;

  try {
    const [result] = await db.query(sql, [
      project_name,
      project_description,
      is_active ?? 1,
    ]);
    const projectId = result.insertId;
    await logAction(`הוספת פרויקט חדש: ${project_name}`);
    res.json({ Status: true, Message: "הפרויקט נוסף בהצלחה" });
  } catch (err) {
    console.error("שגיאה בהוספת פרויקט:", err);
    return res.json({ Status: false, Error: "שגיאה בהוספת פרויקט" });
  }
});

// ✅ עריכת פרויקט קיים
router.put("/edit/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  const { project_name, project_description, is_active } = req.body;

  if (!project_name || project_name.trim() === "") {
    return res.json({ Status: false, Error: "יש להזין שם פרויקט" });
  }

  const sql = `
    UPDATE projects
    SET project_name = ?, project_description = ?, is_active = ?
    WHERE project_id = ?
  `;

  try {
    await db.query(sql, [
      project_name,
      project_description,
      is_active ?? 1,
      id,
    ]);
    await logAction(`עדכון פרויקט #${id}`);
    res.json({ Status: true, Message: "הפרויקט עודכן בהצלחה" });
  } catch (err) {
    console.error("שגיאה בעדכון פרויקט:", err);
    return res.json({ Status: false, Error: "שגיאה בעדכון פרויקט" });
  }
});

// ✅ מחיקה לוגית של פרויקט
router.delete("/delete/:id", verifyToken, async (req, res) => {
  const { id } = req.params;

  const sql = `
    UPDATE projects
    SET is_active = 0
    WHERE project_id = ?
  `;

  try {
    await db.query(sql, [id]);
    await logAction(`מחיקת פרויקט #${id} (לוגית)`);
    res.json({
      Status: true,
      Message: "הפרויקט הועבר לארכיון (מחיקה לוגית)",
    });
  } catch (err) {
    console.error("שגיאה במחיקת פרויקט:", err);
    return res.json({ Status: false, Error: "שגיאה במחיקת פרויקט" });
  }
});

// ✅ שליפת פרויקטים פעילים בלבד
router.get("/active", verifyToken, async (req, res) => {
  const sql = "SELECT * FROM projects WHERE is_active = 1";
  try {
    const [result] = await db.query(sql);
    res.json({ Status: true, Result: result });
  } catch (err) {
    console.error("שגיאה בשליפת פרויקטים פעילים:", err);
    return res.json({ Status: false, Error: "שגיאה בשליפת פרויקטים פעילים" });
  }
});

// ✅ שליפת פרויקטים לא פעילים בלבד
router.get("/inactive", verifyToken, async (req, res) => {
  const sql = "SELECT * FROM projects WHERE is_active = 0";
  try {
    const [result] = await db.query(sql);
    res.json({ Status: true, Result: result });
  } catch (err) {
    console.error("שגיאה בשליפת פרויקטים לא פעילים:", err);
    return res.json({
      Status: false,
      Error: "שגיאה בשליפת פרויקטים לא פעילים",
    });
  }
});

// ✅ שליפת פרויקט לפי ID
router.get("/:id", verifyToken, async (req, res) => {
  const { id } = req.params;

  const sql = "SELECT * FROM projects WHERE project_id = ?";
  try {
    const [result] = await db.query(sql, [id]);

    if (result.length === 0) {
      return res.json({ Status: false, Error: "הפרויקט לא נמצא" });
    }

    res.json({ Status: true, Result: result[0] });
  } catch (err) {
    console.error("שגיאה בשליפת פרויקט לפי ID:", err);
    return res.json({ Status: false, Error: "שגיאה בשליפת פרויקט" });
  }
});

export default router;

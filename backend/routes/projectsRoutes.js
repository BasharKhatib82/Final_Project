import express from "express";
import { db } from "../utils/dbSingleton.js";
import verifyToken from "../utils/verifyToken.js";
import logAction from "../utils/logAction.js";

const router = express.Router();

/* ===============================
   ניהול פרויקטים
================================= */

// ✅ שליפת כל הפרויקטים
router.get("/", verifyToken, async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM projects ORDER BY project_id DESC"
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error("❌ שגיאה בשליפת פרויקטים:", err);
    res.status(500).json({ success: false, message: "שגיאה בשליפת פרויקטים" });
  }
});

// ✅ הוספת פרויקט חדש
router.post("/add", verifyToken, async (req, res) => {
  const { project_name, project_description, active } = req.body;

  if (!project_name?.trim()) {
    return res
      .status(400)
      .json({ success: false, message: "יש להזין שם פרויקט" });
  }

  try {
    const [result] = await db.query(
      `INSERT INTO projects (project_name, project_description, active) VALUES (?, ?, ?)`,
      [project_name.trim(), project_description || null, active ?? 1]
    );

    logAction(`הוספת פרויקט חדש: ${project_name}`)(req, res, () => {});
    res.json({
      success: true,
      data: { project_id: result.insertId },
      message: "הפרויקט נוסף בהצלחה",
    });
  } catch (err) {
    console.error("❌ שגיאה בהוספת פרויקט:", err);
    res.status(500).json({ success: false, message: "שגיאה בהוספת פרויקט" });
  }
});

// ✅ עדכון פרויקט קיים
router.put("/edit/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  const { project_name, project_description, active } = req.body;

  if (!project_name?.trim()) {
    return res
      .status(400)
      .json({ success: false, message: "יש להזין שם פרויקט" });
  }

  try {
    const [result] = await db.query(
      `UPDATE projects SET project_name=?, project_description=?, active=? WHERE project_id=?`,
      [project_name.trim(), project_description || null, active ?? 1, id]
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "פרויקט לא נמצא" });
    }

    logAction(`עדכון פרויקט #${id}`)(req, res, () => {});
    res.json({ success: true, message: "הפרויקט עודכן בהצלחה" });
  } catch (err) {
    console.error("❌ שגיאה בעדכון פרויקט:", err);
    res.status(500).json({ success: false, message: "שגיאה בעדכון פרויקט" });
  }
});

// ✅ מחיקה לוגית של פרויקט
router.delete("/delete/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await db.query(
      `UPDATE projects SET active=0 WHERE project_id=?`,
      [id]
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "פרויקט לא נמצא" });
    }

    logAction(`מחיקת פרויקט #${id} (לוגית)`)(req, res, () => {});
    res.json({ success: true, message: "הפרויקט הועבר לארכיון" });
  } catch (err) {
    console.error("❌ שגיאה במחיקת פרויקט:", err);
    res.status(500).json({ success: false, message: "שגיאה במחיקת פרויקט" });
  }
});

// ✅ שליפת פרויקטים לפי סטטוס (פעילים/לא פעילים)
router.get("/status/:active", verifyToken, async (req, res) => {
  const { active } = req.params;
  const isActive = active === "1" ? 1 : 0;

  try {
    const [rows] = await db.query(`SELECT * FROM projects WHERE active=?`, [
      isActive,
    ]);
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error("❌ שגיאה בשליפת פרויקטים:", err);
    res.status(500).json({ success: false, message: "שגיאה בשליפת פרויקטים" });
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
      return res
        .status(404)
        .json({ success: false, message: "הפרויקט לא נמצא" });
    }

    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error("❌ שגיאה בשליפת פרויקט:", err);
    res.status(500).json({ success: false, message: "שגיאה בשליפת פרויקט" });
  }
});

export default router;

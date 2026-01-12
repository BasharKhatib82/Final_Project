// backend\controllers\projects.controller.js

import { db } from "../utils/dbSingleton.js";
import logAction from "../utils/logAction.js";
import { convertToBit } from "../utils/convertToBit.js";
import { isPositiveInt } from "../utils/fieldValidators.js";

/**
 * שליפת כל הפרויקטים
 * מקבל: —
 * מחזיר: { success, data: Project[] }
 */
export async function listProjects(_req, res) {
  try {
    const [rows] = await db.query(
      "SELECT * FROM projects ORDER BY project_id DESC"
    );
    return res.json({ success: true, data: rows });
  } catch (err) {
    console.error("listProjects:", err);
    return res
      .status(500)
      .json({ success: false, message: "שגיאה בשליפת פרויקטים" });
  }
}

/**
 * הוספת פרויקט חדש
 * מקבל: { project_name (חובה), project_description?, active? (0/1) }
 * מחזיר: { success, data:{project_id}, message }
 */
export async function addProject(req, res) {
  const name = String(req.body.project_name ?? "").trim();
  const desc = req.body.project_description ?? null;
  const active = req.body.active ?? 1;

  if (!name) {
    return res
      .status(400)
      .json({ success: false, message: "יש להזין שם פרויקט" });
  }

  try {
    const [result] = await db.query(
      `INSERT INTO projects (project_name, project_description, active) VALUES (?, ?, ?)`,
      [name, desc || null, convertToBit(active)]
    );

    logAction(`הוספת פרויקט חדש : ${name}`, req.user?.user_id)(
      req,
      res,
      () => {}
    );
    return res.json({
      success: true,
      data: { project_id: result.insertId },
      message: "הפרויקט נוסף בהצלחה",
    });
  } catch (err) {
    console.error("addProject:", err);
    return res
      .status(500)
      .json({ success: false, message: "שגיאה בהוספת פרויקט" });
  }
}

/**
 * עדכון פרויקט קיים
 * מקבל: :id, { project_name (חובה), project_description?, active? (0/1) }
 * מחזיר: { success, message }
 */
export async function updateProject(req, res) {
  const { id } = req.params;
  const name = String(req.body.project_name ?? "").trim();
  const desc = req.body.project_description ?? null;
  const active = req.body.active ?? 1;

  if (!isPositiveInt(id)) {
    return res
      .status(400)
      .json({ success: false, message: "מזהה פרויקט לא תקין" });
  }
  if (!name) {
    return res
      .status(400)
      .json({ success: false, message: "יש להזין שם פרויקט" });
  }

  try {
    const [result] = await db.query(
      `UPDATE projects SET project_name=?, project_description=?, active=? WHERE project_id=?`,
      [name, desc || null, convertToBit(active), Number(id)]
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "פרויקט לא נמצא" });
    }

    logAction(`עדכון פרטי פרויקט : ${name}`, req.user?.user_id)(
      req,
      res,
      () => {}
    );
    return res.json({ success: true, message: "הפרויקט עודכן בהצלחה" });
  } catch (err) {
    console.error("updateProject:", err);
    return res
      .status(500)
      .json({ success: false, message: "שגיאה בעדכון פרויקט" });
  }
}

/**
 * מחיקה לוגית של פרויקט (active=0)
 * מקבל: :id
 * מחזיר: { success, message }
 */
export async function archiveProject(req, res) {
  const { id } = req.params;

  if (!isPositiveInt(id)) {
    return res
      .status(400)
      .json({ success: false, message: "מזהה פרויקט לא תקין" });
  }

  try {
    // 🔹 בדיקה אם קיימות פניות משויכות
    const [leads] = await db.query(
      `SELECT COUNT(*) AS total FROM leads WHERE project_id = ?`,
      [Number(id)]
    );

    if (leads[0].total > 0) {
      return res.status(409).json({
        success: false,
        message: "לא ניתן למחוק פרויקט המשויך לפניות קיימות",
      });
    }

    // 🔹 מחיקה לוגית
    const [result] = await db.query(
      `UPDATE projects SET active=0 WHERE project_id=?`,
      [Number(id)]
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "פרויקט לא נמצא" });
    }

    // 🔹 לוג
    const [rows] = await db.query(
      "SELECT project_name FROM projects WHERE project_id = ?",
      [Number(id)]
    );

    logAction(`מחיקת פרויקט: ${rows[0].project_name}`, req.user?.user_id)(
      req,
      res,
      () => {}
    );

    return res.json({ success: true, message: "הפרויקט הועבר לארכיון" });
  } catch (err) {
    console.error("archiveProject:", err);
    return res
      .status(500)
      .json({ success: false, message: "שגיאה במחיקת פרויקט" });
  }
}

/**
 * שליפת פרויקטים לפי סטטוס (פעיל/לא פעיל)
 * מקבל: :active ('0' או'1'או )
 * מחזיר: { success, data: Project[] }
 */
export async function listByStatus(req, res) {
  const { active } = req.params;
  if (active !== "0" && active !== "1") {
    return res
      .status(400)
      .json({ success: false, message: "ערך active חייב להיות '0' או '1'" });
  }
  const isActive = Number(active);

  try {
    const [rows] = await db.query(`SELECT * FROM projects WHERE active=?`, [
      isActive,
    ]);
    return res.json({ success: true, data: rows });
  } catch (err) {
    console.error("listByStatus:", err);
    return res
      .status(500)
      .json({ success: false, message: "שגיאה בשליפת פרויקטים" });
  }
}

/**
 * שליפת פרויקט לפי מזהה
 * מקבל: :id
 * מחזיר: { success, data: Project }
 */
export async function getProjectById(req, res) {
  const { id } = req.params;

  if (!isPositiveInt(id)) {
    return res
      .status(400)
      .json({ success: false, message: "מזהה פרויקט לא תקין" });
  }

  try {
    const [rows] = await db.query(`SELECT * FROM projects WHERE project_id=?`, [
      Number(id),
    ]);

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "הפרויקט לא נמצא" });
    }

    return res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error("getProjectById:", err);
    return res
      .status(500)
      .json({ success: false, message: "שגיאה בשליפת פרויקט" });
  }
}

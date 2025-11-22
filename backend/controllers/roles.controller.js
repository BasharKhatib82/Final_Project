// backend\controllers\roles.controller.js

import { db } from "../utils/dbSingleton.js";
import logAction from "../utils/logAction.js";
import { roleFields } from "../utils/permissions.js";
import { convertToBit } from "../utils/convertToBit.js";

/**
 * הוספת תפקיד חדש
 */
export async function addRole(req, res) {
  const { role_name, active = 1 } = req.body;

  if (!role_name || typeof role_name !== "string" || role_name.trim() === "") {
    return res
      .status(400)
      .json({ success: false, message: "שם תפקיד חסר או לא תקין" });
  }

  try {
    const [exists] = await db.query(
      "SELECT 1 FROM roles_permissions WHERE role_name = ?",
      [role_name.trim()]
    );
    if (exists.length > 0) {
      return res
        .status(409)
        .json({ success: false, message: "שם תפקיד כבר קיים" });
    }

    const fields = ["role_name", ...roleFields, "active"];
    const placeholders = fields.map(() => "?").join(", ");
    const values = [
      role_name.trim(),
      ...roleFields.map((f) => convertToBit(req.body[f] || 0)),
      convertToBit(active),
    ];

    const [result] = await db.query(
      `INSERT INTO roles_permissions (${fields.join(
        ", "
      )}) VALUES (${placeholders})`,
      values
    );

    logAction(`הוספת תפקיד : ${role_name}`, req.user?.user_id)(
      req,
      res,
      () => {}
    );

    return res.status(201).json({ success: true, result });
  } catch (err) {
    console.error("שגיאת יצירת תפקיד:", err);
    return res
      .status(500)
      .json({ success: false, message: "שגיאת שרת ביצירת תפקיד" });
  }
}

/**
 * שליפת תפקידים פעילים
 */
export async function getActiveRoles(req, res) {
  try {
    const [results] = await db.query(
      "SELECT * FROM roles_permissions WHERE active = 1 ORDER BY role_id ASC"
    );
    return res.status(200).json({ success: true, data: results });
  } catch (err) {
    console.error("שגיאת שליפת תפקידים פעילים:", err);
    return res.status(500).json({ success: false, message: "שגיאת שליפה" });
  }
}

/**
 * שליפת תפקידים לא פעילים
 */
export async function getInactiveRoles(req, res) {
  try {
    const [results] = await db.query(
      "SELECT * FROM roles_permissions WHERE active = 0 ORDER BY role_id ASC"
    );
    return res.status(200).json({ success: true, data: results });
  } catch (err) {
    console.error("שגיאת שליפת תפקידים לא פעילים:", err);
    return res.status(500).json({ success: false, message: "שגיאת שליפה" });
  }
}

/**
 * שליפת כל התפקידים
 */
export async function getAllRoles(req, res) {
  try {
    const [results] = await db.query("SELECT * FROM roles_permissions");
    return res.status(200).json({ success: true, data: results });
  } catch (err) {
    console.error("שגיאת שליפת תפקידים:", err);
    return res.status(500).json({ success: false, message: "שגיאת שליפה" });
  }
}

/**
 * שליפת תפקיד לפי מזהה
 */
export async function getRoleById(req, res) {
  const roleId = req.params.id;
  try {
    const [results] = await db.query(
      "SELECT * FROM roles_permissions WHERE role_id = ?",
      [roleId]
    );
    if (results.length === 0) {
      return res.status(404).json({ success: false, message: "תפקיד לא נמצא" });
    }
    return res.status(200).json({ success: true, data: results[0] });
  } catch (err) {
    console.error("שגיאת שליפת תפקיד לפי מזהה:", err);
    return res
      .status(500)
      .json({ success: false, message: "שגיאת שליפה מהשרת" });
  }
}

/**
 * עדכון תפקיד לפי מזהה
 */
export async function updateRole(req, res) {
  const role_id = parseInt(req.params.id, 10);

  if (role_id === 1) {
    return res
      .status(403)
      .json({ success: false, message: 'לא ניתן לערוך את תפקיד המנכ"ל' });
  }

  const { role_name, active } = req.body;

  if (!role_name || typeof role_name !== "string" || role_name.trim() === "") {
    return res
      .status(400)
      .json({ success: false, message: "שם תפקיד לא תקין" });
  }

  try {
    const [dup] = await db.query(
      "SELECT 1 FROM roles_permissions WHERE role_name = ? AND role_id <> ?",
      [role_name.trim(), role_id]
    );
    if (dup.length > 0) {
      return res
        .status(409)
        .json({ success: false, message: "שם תפקיד כבר קיים" });
    }

    const setClause = [
      "role_name = ?",
      ...roleFields.map((f) => `${f} = ?`),
      "active = ?",
    ].join(", ");

    const values = [
      role_name.trim(),
      ...roleFields.map((f) => convertToBit(req.body[f] || 0)),
      convertToBit(active),
      role_id,
    ];

    const [result] = await db.query(
      `UPDATE roles_permissions SET ${setClause} WHERE role_id = ?`,
      values
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "תפקיד לא נמצא לעדכון" });
    }

    logAction(`עדכון תפקיד : ${role_name}`, req.user?.user_id)(
      req,
      res,
      () => {}
    );
    return res.status(200).json({ success: true, message: "עודכן בהצלחה" });
  } catch (err) {
    console.error("שגיאת עדכון תפקיד:", err);
    return res
      .status(500)
      .json({ success: false, message: "שגיאת עדכון תפקיד" });
  }
}

/**
 * מחיקה לוגית של תפקיד
 */
export async function deleteRole(req, res) {
  const roleId = parseInt(req.params.id, 10);

  if (roleId === 1) {
    return res
      .status(403)
      .json({ success: false, message: "לא ניתן למחוק את תפקיד מנהל כללי" });
  }

  try {
    // שליפת שם התפקיד לפי ID
    const [roles] = await db.query(
      "SELECT role_name FROM roles_permissions WHERE role_id = ?",
      [roleId]
    );

    if (roles.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "תפקיד לא נמצא למחיקה" });
    }

    const roleName = roles[0].role_name;

    const [result] = await db.query(
      "UPDATE roles_permissions SET active = 0 WHERE role_id = ?",
      [roleId]
    );

    // אם לא שונה כלום – ייתכן שהתפקיד כבר היה לא פעיל
    if (result.affectedRows === 0) {
      return res.status(400).json({
        success: false,
        message: "לא בוצע שינוי – ייתכן שהתפקיד כבר לא פעיל",
      });
    }

    // רק אם הצליח – לרשום בלוג ולהחזיר תשובה
    logAction(`מחיקת תפקיד: ${roleName}`, req.user?.user_id)(
      req,
      res,
      () => {}
    );

    return res
      .status(200)
      .json({ success: true, message: "התפקיד הוסר בהצלחה" });
  } catch (err) {
    console.error("שגיאת מחיקה:", err);
    return res
      .status(500)
      .json({ success: false, message: "שגיאת מחיקה מהשרת" });
  }
}

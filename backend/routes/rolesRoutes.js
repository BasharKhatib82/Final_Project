import express from "express";
import { db } from "../utils/dbSingleton.js";
import logAction from "../utils/logAction.js";
import verifyToken from "../utils/verifyToken.js";

const router = express.Router();

// ✅ הוספת תפקיד חדש
router.post("/add", verifyToken, async (req, res) => {
  const {
    role_name,
    can_manage_users = 0,
    can_view_reports = 0,
    can_assign_leads = 0,
    can_edit_courses = 0,
    can_manage_tasks = 0,
    can_access_all_data = 0,
  } = req.body;

  if (!role_name || typeof role_name !== "string" || role_name.trim() === "") {
    return res
      .status(400)
      .json({ Status: false, Error: "שם תפקיד חסר או לא תקין" });
  }

  try {
    const [checkResult] = await db.query(
      "SELECT * FROM roles_permissions WHERE role_name = ?",
      [role_name]
    );

    if (checkResult.length > 0) {
      return res
        .status(409)
        .json({ Status: false, Error: "שם תפקיד כבר קיים" });
    }

    const insertQuery = `
      INSERT INTO roles_permissions (
        role_name, can_manage_users, can_view_reports,
        can_assign_leads, can_edit_courses, can_manage_tasks,
        can_access_all_data
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`;

    const [result] = await db.query(insertQuery, [
      role_name,
      can_manage_users,
      can_view_reports,
      can_assign_leads,
      can_edit_courses,
      can_manage_tasks,
      can_access_all_data,
    ]);

    await logAction("הוספת תפקיד חדש");
    res.status(201).json({ Status: true, Result: result });
  } catch (err) {
    console.error("שגיאת יצירת תפקיד:", err);
    return res
      .status(500)
      .json({ Status: false, Error: "שגיאת שרת ביצירת תפקיד" });
  }
});

// ✅ שליפת תפקידים פעילים
router.get(
  "/active",
  verifyToken,
  logAction("צפייה בתפקידים פעילים"),
  async (req, res) => {
    try {
      const [results] = await db.query(
        "SELECT * FROM roles_permissions WHERE active = 1"
      );
      res.status(200).json({ Status: true, Roles: results });
    } catch (err) {
      console.error("שגיאת שליפת תפקידים פעילים:", err);
      return res.status(500).json({ Status: false, Error: "שגיאת שליפה" });
    }
  }
);

// ✅ שליפת תפקידים לא פעילים
router.get(
  "/inactive",
  verifyToken,
  logAction("צפייה בתפקידים לא פעילים"),
  async (req, res) => {
    try {
      const [results] = await db.query(
        "SELECT * FROM roles_permissions WHERE active = 0"
      );
      res.status(200).json({ Status: true, Roles: results });
    } catch (err) {
      console.error("שגיאת שליפת תפקידים לא פעילים:", err);
      return res.status(500).json({ Status: false, Error: "שגיאת שליפה" });
    }
  }
);

// ✅ שליפת כל התפקידים
router.get("/", verifyToken, async (req, res) => {
  try {
    const [results] = await db.query("SELECT * FROM roles_permissions");
    await logAction("צפייה ברשימת תפקידים");
    res.status(200).json({ Status: true, Roles: results });
  } catch (err) {
    console.error("שגיאת שליפת תפקידים:", err);
    return res.status(500).json({ Status: false, Error: "שגיאת שליפה" });
  }
});

// ✅ שליפת תפקיד לפי מזהה
router.get("/:id", verifyToken, async (req, res) => {
  const roleId = req.params.id;
  try {
    const [results] = await db.query(
      "SELECT * FROM roles_permissions WHERE role_id = ?",
      [roleId]
    );
    if (results.length === 0) {
      return res.status(404).json({ Status: false, Error: "תפקיד לא נמצא" });
    }
    await logAction("צפייה בפרטי תפקיד");
    res.status(200).json({ Status: true, Role: results[0] });
  } catch (err) {
    console.error("שגיאת שליפת תפקיד לפי מזהה:", err);
    return res.status(500).json({ Status: false, Error: "שגיאת שליפה מהשרת" });
  }
});

// ✅ עדכון תפקיד לפי מזהה
router.put("/:id", verifyToken, async (req, res) => {
  const role_id = req.params.id;
  const {
    role_name,
    can_manage_users,
    can_view_reports,
    can_assign_leads,
    can_edit_courses,
    can_manage_tasks,
    can_access_all_data,
    active,
  } = req.body;

  if (!role_name || typeof role_name !== "string" || role_name.trim() === "") {
    return res.status(400).json({ Status: false, Error: "שם תפקיד לא תקין" });
  }

  const updateQuery = `
    UPDATE roles_permissions SET
      role_name = ?, can_manage_users = ?, can_view_reports = ?,
      can_assign_leads = ?, can_edit_courses = ?, can_manage_tasks = ?,
      can_access_all_data = ?, active = ?
    WHERE role_id = ?`;

  try {
    const [result] = await db.query(updateQuery, [
      role_name,
      can_manage_users,
      can_view_reports,
      can_assign_leads,
      can_edit_courses,
      can_manage_tasks,
      can_access_all_data,
      active,
      role_id,
    ]);

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ Status: false, Error: "תפקיד לא נמצא לעדכון" });
    }

    await logAction(`עדכון תפקיד מס : ${role_id}`);
    res.status(200).json({ Status: true, Message: "עודכן בהצלחה" });
  } catch (err) {
    console.error("שגיאת עדכון תפקיד:", err);
    return res.status(500).json({ Status: false, Error: "שגיאת עדכון תפקיד" });
  }
});

// ✅ מחיקה לוגית של תפקיד
router.put("/delete/:id", verifyToken, async (req, res) => {
  const roleId = req.params.id;

  try {
    const [result] = await db.query(
      "UPDATE roles_permissions SET active = 0 WHERE role_id = ?",
      [roleId]
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ Status: false, Error: "תפקיד לא נמצא למחיקה" });
    }

    await logAction(`מחיקת תפקיד מס : ${roleId}`);
    res
      .status(200)
      .json({ Status: true, Message: "התפקיד הוסר בהצלחה (מחיקה לוגית)" });
  } catch (err) {
    console.error("שגיאת מחיקה:", err);
    return res.status(500).json({ Status: false, Error: "שגיאת מחיקה מהשרת" });
  }
});

export default router;

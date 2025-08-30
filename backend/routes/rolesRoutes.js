import express from "express";
import { db } from "../utils/dbSingleton.js";
import logAction from "../utils/logAction.js";
import verifyToken from "../utils/verifyToken.js";

const router = express.Router();

// helper: קבלת 0/1 מכל קלט אפשרי (boolean/"0"/"1"/מספר)
const toBit = (v) => (v === true || v === 1 || v === "1" ? 1 : 0);

// ✅ הוספת תפקיד חדש
router.post("/add", verifyToken, async (req, res) => {
  const {
    role_name,
    role_management = 0,
    can_manage_users = 0,
    can_view_reports = 0,
    can_assign_leads = 0,
    can_edit_courses = 0,
    can_manage_tasks = 0,
    can_access_all_data = 0,
    attendance_clock_self = 0,
    attendance_add_btn = 0,
    attendance_edit_btn = 0,
    attendance_view_team = 0,
    active = 1,
  } = req.body;

  if (!role_name || typeof role_name !== "string" || role_name.trim() === "") {
    return res
      .status(400)
      .json({ Status: false, Error: "שם תפקיד חסר או לא תקין" });
  }

  try {
    const [exists] = await db.query(
      "SELECT 1 FROM roles_permissions WHERE role_name = ?",
      [role_name.trim()]
    );
    if (exists.length > 0) {
      return res
        .status(409)
        .json({ Status: false, Error: "שם תפקיד כבר קיים" });
    }

    const [result] = await db.query(
      `INSERT INTO roles_permissions (
        role_name, role_management, can_manage_users, can_view_reports,
        can_assign_leads, can_edit_courses, can_manage_tasks,
        can_access_all_data,attendance_clock_self,attendance_add_btn,attendance_edit_btn,attendance_view_team, active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        role_name.trim(),
        toBit(role_management),
        toBit(can_manage_users),
        toBit(can_view_reports),
        toBit(can_assign_leads),
        toBit(can_edit_courses),
        toBit(can_manage_tasks),
        toBit(can_access_all_data),
        toBit(attendance_clock_self),
        toBit(attendance_add_btn),
        toBit(attendance_edit_btn),
        toBit(attendance_view_team),
        toBit(active),
      ]
    );

    await logAction("הוספת תפקיד חדש");
    return res.status(201).json({ Status: true, Result: result });
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

  async (req, res) => {
    try {
      const [results] = await db.query(
        "SELECT * FROM roles_permissions WHERE active = 1 ORDER BY role_id ASC"
      );
      return res.status(200).json({ Status: true, Roles: results });
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

  async (req, res) => {
    try {
      const [results] = await db.query(
        "SELECT * FROM roles_permissions WHERE active = 0 ORDER BY role_id ASC"
      );
      return res.status(200).json({ Status: true, Roles: results });
    } catch (err) {
      console.error("שגיאת שליפת תפקידים לא פעילים:", err);
      return res.status(500).json({ Status: false, Error: "שגיאת שליפה" });
    }
  }
);

// ✅ שליפת כל התפקידים
router.get("/", verifyToken, async (req, res) => {
  try {
    const [results] = await db.query(
      "SELECT * FROM roles_permissions ORDER BY role_id ASC"
    );

    return res.status(200).json({ Status: true, Roles: results });
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

    return res.status(200).json({ Status: true, Role: results[0] });
  } catch (err) {
    console.error("שגיאת שליפת תפקיד לפי מזהה:", err);
    return res.status(500).json({ Status: false, Error: "שגיאת שליפה מהשרת" });
  }
});

// ✅ עדכון תפקיד לפי מזהה (כולל role_management)
router.put("/:id", verifyToken, async (req, res) => {
  const role_id = req.params.id;
  const {
    role_name,
    role_management,
    can_manage_users,
    can_view_reports,
    can_assign_leads,
    can_edit_courses,
    can_manage_tasks,
    can_access_all_data,
    attendance_clock_self,
    attendance_add_btn,
    attendance_edit_btn,
    attendance_view_team,
    active,
  } = req.body;

  if (!role_name || typeof role_name !== "string" || role_name.trim() === "") {
    return res.status(400).json({ Status: false, Error: "שם תפקיד לא תקין" });
  }

  try {
    // מניעת כפילות שם (מלבד התפקיד עצמו)
    const [dup] = await db.query(
      "SELECT 1 FROM roles_permissions WHERE role_name=? AND role_id<>?",
      [role_name.trim(), role_id]
    );
    if (dup.length > 0) {
      return res
        .status(409)
        .json({ Status: false, Error: "שם תפקיד כבר קיים" });
    }

    const [result] = await db.query(
      `UPDATE roles_permissions SET
        role_name = ?, role_management = ?, can_manage_users = ?, can_view_reports = ?,
        can_assign_leads = ?, can_edit_courses = ?, can_manage_tasks = ?,
        can_access_all_data = ?,attendance_clock_self=?,attendance_add_btn=?,attendance_edit_btn=?,attendance_view_team=?, active = ?
       WHERE role_id = ?`,
      [
        role_name.trim(),
        toBit(role_management),
        toBit(can_manage_users),
        toBit(can_view_reports),
        toBit(can_assign_leads),
        toBit(can_edit_courses),
        toBit(can_manage_tasks),
        toBit(can_access_all_data),
        toBit(attendance_clock_self),
        toBit(attendance_add_btn),
        toBit(attendance_edit_btn),
        toBit(attendance_view_team),
        toBit(active),
        role_id,
      ]
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ Status: false, Error: "תפקיד לא נמצא לעדכון" });
    }

    await logAction(`עדכון תפקיד מס : ${role_id}`);
    return res.status(200).json({ Status: true, Message: "עודכן בהצלחה" });
  } catch (err) {
    console.error("שגיאת עדכון תפקיד:", err);
    return res.status(500).json({ Status: false, Error: "שגיאת עדכון תפקיד" });
  }
});

// ✅ מחיקה לוגית של תפקיד (active=0)
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
    return res
      .status(200)
      .json({ Status: true, Message: "התפקיד הוסר בהצלחה (מחיקה לוגית)" });
  } catch (err) {
    console.error("שגיאת מחיקה:", err);
    return res.status(500).json({ Status: false, Error: "שגיאת מחיקה מהשרת" });
  }
});

export default router;

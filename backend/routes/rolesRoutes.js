import express from "express";
import { db } from "../utils/dbSingleton.js";
import logAction from "../utils/logAction.js";
import verifyToken from "../utils/verifyToken.js";

const router = express.Router();

/** Normalize any bit-like value (0/1, "0"/"1", boolean) to 0/1 */
const toBit = (v) => (v === true || v === 1 || v === "1" ? 1 : 0);

/** Unified JSON response helper */
const sendResponse = (
  res,
  success,
  data = null,
  message = null,
  status = 200
) => {
  res.status(status).json({ success, data, message });
};

// ✅ Create role
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
    active = 1,
  } = req.body;

  if (!role_name || typeof role_name !== "string" || role_name.trim() === "") {
    return sendResponse(res, false, null, "שם תפקיד חסר או לא תקין", 400);
  }

  try {
    // Unique name check
    const [exists] = await db.query(
      "SELECT 1 FROM roles_permissions WHERE role_name = ?",
      [role_name.trim()]
    );
    if (exists.length > 0) {
      return sendResponse(res, false, null, "שם תפקיד כבר קיים", 409);
    }

    // Insert with ALL columns that exist in the screenshot schema
    const [result] = await db.query(
      `INSERT INTO roles_permissions (
        role_name, role_management, can_manage_users, can_view_reports,
        can_assign_leads, can_edit_courses, can_manage_tasks,
        can_access_all_data, active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        role_name.trim(),
        toBit(role_management),
        toBit(can_manage_users),
        toBit(can_view_reports),
        toBit(can_assign_leads),
        toBit(can_edit_courses),
        toBit(can_manage_tasks),
        toBit(can_access_all_data),
        toBit(active),
      ]
    );

    logAction(`הוספת תפקיד חדש: ${role_name}`)(req, res, () => {});
    return sendResponse(
      res,
      true,
      { role_id: result.insertId },
      "התפקיד נוסף בהצלחה",
      201
    );
  } catch (err) {
    console.error("❌ שגיאת יצירת תפקיד:", err);
    return sendResponse(res, false, null, "שגיאת שרת ביצירת תפקיד", 500);
  }
});

// ✅ List roles (optional ?active=0/1)
router.get("/", verifyToken, async (req, res) => {
  const { active } = req.query;
  let sql = "SELECT * FROM roles_permissions";
  const params = [];

  if (active === "0" || active === "1") {
    sql += " WHERE active = ?";
    params.push(active);
  }

  try {
    const [rows] = await db.query(sql, params);
    logAction("צפייה ברשימת תפקידים")(req, res, () => {});
    return sendResponse(res, true, rows);
  } catch (err) {
    console.error("❌ שגיאת שליפת תפקידים:", err);
    return sendResponse(res, false, null, "שגיאה בשליפת תפקידים", 500);
  }
});

// ✅ Get role by id
router.get("/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query(
      "SELECT * FROM roles_permissions WHERE role_id = ?",
      [id]
    );
    if (rows.length === 0) {
      return sendResponse(res, false, null, "תפקיד לא נמצא", 404);
    }
    logAction(`צפייה בפרטי תפקיד #${id}`)(req, res, () => {});
    return sendResponse(res, true, rows[0]);
  } catch (err) {
    console.error("❌ שגיאת שליפת תפקיד:", err);
    return sendResponse(res, false, null, "שגיאת שליפה מהשרת", 500);
  }
});

// ✅ Update role by id
router.put("/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  const {
    role_name,
    role_management,
    can_manage_users,
    can_view_reports,
    can_assign_leads,
    can_edit_courses,
    can_manage_tasks,
    can_access_all_data,
    active,
  } = req.body;

  if (!role_name || typeof role_name !== "string" || role_name.trim() === "") {
    return sendResponse(res, false, null, "שם תפקיד לא תקין", 400);
  }

  try {
    // Unique name check for updates (ignore self)
    const [dup] = await db.query(
      "SELECT 1 FROM roles_permissions WHERE role_name = ? AND role_id <> ?",
      [role_name.trim(), id]
    );
    if (dup.length > 0) {
      return sendResponse(res, false, null, "שם תפקיד כבר קיים", 409);
    }

    const [result] = await db.query(
      `UPDATE roles_permissions SET
        role_name=?,
        role_management=?,
        can_manage_users=?,
        can_view_reports=?,
        can_assign_leads=?,
        can_edit_courses=?,
        can_manage_tasks=?,
        can_access_all_data=?,
        active=?
      WHERE role_id=?`,
      [
        role_name.trim(),
        toBit(role_management),
        toBit(can_manage_users),
        toBit(can_view_reports),
        toBit(can_assign_leads),
        toBit(can_edit_courses),
        toBit(can_manage_tasks),
        toBit(can_access_all_data),
        toBit(active),
        id,
      ]
    );

    if (result.affectedRows === 0) {
      return sendResponse(res, false, null, "תפקיד לא נמצא לעדכון", 404);
    }

    logAction(`עדכון תפקיד #${id}`)(req, res, () => {});
    return sendResponse(res, true, null, "התפקיד עודכן בהצלחה");
  } catch (err) {
    console.error("❌ שגיאת עדכון תפקיד:", err);
    return sendResponse(res, false, null, "שגיאה בעדכון תפקיד", 500);
  }
});

// ✅ Soft delete (active=0)
router.delete("/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await db.query(
      "UPDATE roles_permissions SET active=0 WHERE role_id=?",
      [id]
    );
    if (result.affectedRows === 0) {
      return sendResponse(res, false, null, "תפקיד לא נמצא למחיקה", 404);
    }
    logAction(`מחיקת תפקיד #${id}`)(req, res, () => {});
    return sendResponse(res, true, null, "התפקיד הוסר בהצלחה (מחיקה לוגית)");
  } catch (err) {
    console.error("❌ שגיאת מחיקה:", err);
    return sendResponse(res, false, null, "שגיאת מחיקה מהשרת", 500);
  }
});

export default router;

import express from "express";
import { db } from "../utils/dbSingleton.js";
import logAction from "../utils/logAction.js";
import verifyToken from "../utils/verifyToken.js";
import { roleFields } from "../utils/permissions.js"; // 👈 שימוש בקובץ העזר

const router = express.Router();

// helper: קבלת 0/1 מכל קלט אפשרי (boolean/"0"/"1"/מספר)
const toBit = (v) => (v === true || v === 1 || v === "1" ? 1 : 0);

// ✅ הוספת תפקיד חדש
router.post("/add", verifyToken, async (req, res) => {
  const { role_name, active = 1 } = req.body;

  if (!role_name || typeof role_name !== "string" || role_name.trim() === "") {
    return res
      .status(400)
      .json({ success: false, Error: "שם תפקיד חסר או לא תקין" });
  }

  try {
    const [exists] = await db.query(
      "SELECT 1 FROM roles_permissions WHERE role_name = ?",
      [role_name.trim()]
    );
    if (exists.length > 0) {
      return res
        .status(409)
        .json({ success: false, Error: "שם תפקיד כבר קיים" });
    }

    // נבנה דינמית את רשימת השדות והערכים
    const fields = ["role_name", ...roleFields, "active"];
    const placeholders = fields.map(() => "?").join(", ");

    const values = [
      role_name.trim(),
      ...roleFields.map((f) => toBit(req.body[f] || 0)),
      toBit(active),
    ];

    const [result] = await db.query(
      `INSERT INTO roles_permissions (${fields.join(
        ", "
      )}) VALUES (${placeholders})`,
      values
    );

    await logAction("הוספת תפקיד חדש");
    return res.status(201).json({ success: true, Result: result });
  } catch (err) {
    console.error("שגיאת יצירת תפקיד:", err);
    return res
      .status(500)
      .json({ Status: false, Error: "שגיאת שרת ביצירת תפקיד" });
  }
});

// ✅ שליפת תפקידים פעילים
router.get("/active", verifyToken, async (req, res) => {
  try {
    const [results] = await db.query(
      "SELECT * FROM roles_permissions WHERE active = 1 ORDER BY role_id ASC"
    );
    return res.status(200).json({ success: true, data: results });
  } catch (err) {
    console.error("שגיאת שליפת תפקידים פעילים:", err);
    return res.status(500).json({ success: false, massage: "שגיאת שליפה" });
  }
});

// ✅ שליפת תפקידים לא פעילים
router.get("/inactive", verifyToken, async (req, res) => {
  try {
    const [results] = await db.query(
      "SELECT * FROM roles_permissions WHERE active = 0 ORDER BY role_id ASC"
    );
    return res.status(200).json({ success: true, data: results });
  } catch (err) {
    console.error("שגיאת שליפת תפקידים לא פעילים:", err);
    return res.status(500).json({ success: false, massage: "שגיאת שליפה" });
  }
});

// ✅ שליפת כל התפקידים
router.get("/", verifyToken, async (req, res) => {
  try {
    const [results] = await db.query(
      "SELECT * FROM roles_permissions ORDER BY role_id ASC"
    );
    return res.status(200).json({ success: true, data: results });
  } catch (err) {
    console.error("שגיאת שליפת תפקידים:", err);
    return res.status(500).json({ success: false, massage: "שגיאת שליפה" });
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
      return res.status(404).json({ success: false, massage: "תפקיד לא נמצא" });
    }

    return res.status(200).json({ success: true, data: results[0] });
  } catch (err) {
    console.error("שגיאת שליפת תפקיד לפי מזהה:", err);
    return res.status(500).json({ success: false, massage: "שגיאת שליפה מהשרת" });
  }
});

// ✅ עדכון תפקיד לפי מזהה (מנהל כללי חסום)
router.put("/:id", verifyToken, async (req, res) => {
  const role_id = parseInt(req.params.id, 10);

  if (role_id === 1) {
    return res
      .status(403)
      .json({ success: false, massage: 'לא ניתן לערוך את תפקיד המנכ"ל' });
  }

  const { role_name, active } = req.body;

  if (!role_name || typeof role_name !== "string" || role_name.trim() === "") {
    return res.status(400).json({ success: false, massage: "שם תפקיד לא תקין" });
  }

  try {
    // מניעת כפילות שם תפקיד (למעט התפקיד הנוכחי)
    const [dup] = await db.query(
      "SELECT 1 FROM roles_permissions WHERE role_name=? AND role_id<>?",
      [role_name.trim(), role_id]
    );
    if (dup.length > 0) {
      return res
        .status(409)
        .json({ success: false, massage: "שם תפקיד כבר קיים" });
    }

    // נבנה דינמית SET
    const setClause = [
      "role_name = ?",
      ...roleFields.map((f) => `${f} = ?`),
      "active = ?",
    ].join(", ");

    const values = [
      role_name.trim(),
      ...roleFields.map((f) => toBit(req.body[f] || 0)),
      toBit(active),
      role_id,
    ];

    const [result] = await db.query(
      `UPDATE roles_permissions SET ${setClause} WHERE role_id = ?`,
      values
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, massage: "תפקיד לא נמצא לעדכון" });
    }

    await logAction(`עדכון תפקיד : ${role_name}`);
    return res.status(200).json({ success: true, massage: "עודכן בהצלחה" });
  } catch (err) {
    console.error("שגיאת עדכון תפקיד:", err);
    return res.status(500).json({ success: false, massage: "שגיאת עדכון תפקיד" });
  }
});

// ✅ מחיקה לוגית של תפקיד (active=0, מנכ"ל חסום)
router.put("/delete/:id", verifyToken, async (req, res) => {
  const roleId = parseInt(req.params.id, 10);

  if (roleId === 1) {
    return res
      .status(403)
      .json({ success: false, massage: "לא ניתן למחוק את תפקיד מנהל כללי" });
  }

  try {
    const [result] = await db.query(
      "UPDATE roles_permissions SET active = 0 WHERE role_id = ?",
      [roleId]
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, massage: "תפקיד לא נמצא למחיקה" });
    }

    await logAction(`מחיקת תפקיד : ${role_name}`);
    return res
      .status(200)
      .json({ success: true, massage: "התפקיד הוסר בהצלחה (מחיקה לוגית)" });
  } catch (err) {
    console.error("שגיאת מחיקה:", err);
    return res.status(500).json({ success: false, massage: "שגיאת מחיקה מהשרת" });
  }
});

export default router;

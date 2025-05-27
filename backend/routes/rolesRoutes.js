import express from "express";
import dbSingleton from "../utils/dbSingleton.js";
import logAction from "../utils/logAction.js";
import verifyToken from "../utils/verifyToken.js";

const connection = dbSingleton.getConnection();
const router = express.Router();

// ✅ הוספת תפקיד חדש
router.post("/add", verifyToken, (req, res) => {
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

  connection.query(
    "SELECT * FROM roles_permissions WHERE role_name = ?",
    [role_name],
    (checkErr, checkResult) => {
      if (checkErr) {
        return res
          .status(500)
          .json({ Status: false, Error: "שגיאה בבדיקת כפילות" });
      }

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

      connection.query(
        insertQuery,
        [
          role_name,
          can_manage_users,
          can_view_reports,
          can_assign_leads,
          can_edit_courses,
          can_manage_tasks,
          can_access_all_data,
        ],
        (insertErr, result) => {
          if (insertErr) {
            console.error("שגיאת יצירת תפקיד:", insertErr);
            return res
              .status(500)
              .json({ Status: false, Error: "שגיאת שרת ביצירת תפקיד" });
          }

          // ✅
          logAction("הוספת תפקיד חדש")(req, res, () => {});
          res.status(201).json({ Status: true, Result: result });
        }
      );
    }
  );
});

// ✅ שליפת תפקידים פעילים
router.get(
  "/active",
  verifyToken,
  logAction("צפייה בתפקידים פעילים"),
  (req, res) => {
    connection.query(
      "SELECT * FROM roles_permissions WHERE active = 1",
      (err, results) => {
        if (err)
          return res.status(500).json({ Status: false, Error: "שגיאת שליפה" });
        res.status(200).json({ Status: true, Roles: results });
      }
    );
  }
);

// ✅ שליפת תפקידים לא פעילים
router.get(
  "/inactive",
  verifyToken,
  logAction("צפייה בתפקידים לא פעילים"),
  (req, res) => {
    connection.query(
      "SELECT * FROM roles_permissions WHERE active = 0",
      (err, results) => {
        if (err)
          return res.status(500).json({ Status: false, Error: "שגיאת שליפה" });
        res.status(200).json({ Status: true, Roles: results });
      }
    );
  }
);

// ✅ שליפת כל התפקידים
// router.get("/", verifyToken, logAction("צפייה ברשימת תפקידים"), (req, res) => {
//   connection.query("SELECT * FROM roles_permissions", (err, results) => {
//     if (err)
//       return res.status(500).json({ Status: false, Error: "שגיאת שליפה" });
//     res.status(200).json({ Status: true, Roles: results });
//   });
// });

// ✅ שליפת תפקיד לפי מזהה
router.get("/:id", verifyToken, (req, res) => {
  const roleId = req.params.id;
  connection.query(
    "SELECT * FROM roles_permissions WHERE role_id = ?",
    [roleId],
    (err, results) => {
      if (err)
        return res
          .status(500)
          .json({ Status: false, Error: "שגיאת שליפה מהשרת" });
      if (results.length === 0)
        return res.status(404).json({ Status: false, Error: "תפקיד לא נמצא" });
      logAction("צפייה בפרטי תפקיד"),
        res.status(200).json({ Status: true, Role: results[0] });
    }
  );
});

// ✅ עדכון תפקיד לפי מזהה
router.put("/:id", verifyToken, (req, res) => {
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

  connection.query(
    updateQuery,
    [
      role_name,
      can_manage_users,
      can_view_reports,
      can_assign_leads,
      can_edit_courses,
      can_manage_tasks,
      can_access_all_data,
      active,
      role_id,
    ],
    (err, result) => {
      if (err)
        return res
          .status(500)
          .json({ Status: false, Error: "שגיאת עדכון תפקיד" });

      if (result.affectedRows === 0) {
        return res
          .status(404)
          .json({ Status: false, Error: "תפקיד לא נמצא לעדכון" });
      }

      logAction(`עדכון תפקיד מס : ${role_id}`)(req, res, () => {});
      res.status(200).json({ Status: true, Message: "עודכן בהצלחה" });
    }
  );
});

// ✅ מחיקה לוגית של תפקיד
router.put("/delete/:id", verifyToken, (req, res) => {
  const roleId = req.params.id;

  connection.query(
    "UPDATE roles_permissions SET active = 0 WHERE role_id = ?",
    [roleId],
    (err, result) => {
      if (err)
        return res
          .status(500)
          .json({ Status: false, Error: "שגיאת מחיקה מהשרת" });

      if (result.affectedRows === 0) {
        return res
          .status(404)
          .json({ Status: false, Error: "תפקיד לא נמצא למחיקה" });
      }

      logAction(`מחיקת תפקיד מס : ${roleId}`)(req, res, () => {});
      res
        .status(200)
        .json({ Status: true, Message: "התפקיד הוסר בהצלחה (מחיקה לוגית)" });
    }
  );
});

export default router;

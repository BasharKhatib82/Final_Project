import express from "express";
import dbSingleton from "../utils/dbSingleton.js";
import logAction from "../utils/logAction.js";
import verifyToken from "../utils/verifyToken.js";


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









export default router;
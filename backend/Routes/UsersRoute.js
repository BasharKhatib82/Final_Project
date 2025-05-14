const express = require("express");
const dbSingleton = require("../utils/dbSingleton");
const bcrypt = require("bcrypt");
const connection = dbSingleton.getConnection();
const router = express.Router();

// NOTE : התחברות משתמש ושמירת מידע בסשן + קוקי
router.post("/login", (req, res) => {
  const { user_id, password } = req.body;
  const sql = "SELECT * FROM users WHERE user_id = ?";

  connection.query(sql, [user_id], (err, results) => {
    if (err)
      return res.status(500).json({ success: false, message: "שגיאת שאילתה" });

    if (results.length === 0)
      return res.status(401).json({ success: false, message: "משתמש לא קיים" });

    const user = results[0];

    bcrypt.compare(password, user.password, (bcryptErr, match) => {
      if (bcryptErr)
        return res.status(500).json({ success: false, message: "שגיאת אימות" });

      if (!match) {
        return res.status(401).json({ success: false, message: "סיסמה שגויה" });
      }

      const fullName = `${user.first_name} ${user.last_name}`;
      req.session.user = {
        id: user.user_id,
        user_name: fullName,
        role_id: user.role_id,
      };

      res.cookie("user_name", fullName, {
        maxAge: 1000 * 60 * 60 * 24,
        httpOnly: false,
        sameSite: "Lax",
      });
      res.json({
        success: true,
        user_name: fullName,
        role_id: user.role_id,
        first_name: user.first_name,
        last_name: user.last_name,
      });
    });
  });
});

// NOTE :kjjnkl
router.get("/active-users", (req, res) => {
  const query = "SELECT * FROM users WHERE is_active = 1";
  connection.query(query, (err, results) => {
    if (err)
      return res.status(500).json({ Status: false, Error: "Database Error" });
    return res.status(200).json({ Status: true, Result: results });
  });
});

// NOTE : jhdkjc
router.get("/inactive-users", (req, res) => {
  const query = "SELECT * FROM users WHERE is_active = 0";
  connection.query(query, (err, results) => {
    if (err)
      return res.status(500).json({ Status: false, Error: "Database Error" });
    return res.status(200).json({ Status: true, Result: results });
  });
});

// NOTE : בדיקה אם המשתמש מחובר
router.get("/check-auth", (req, res) => {
  if (req.session.user) {
    return res.json({ loggedIn: true, user: req.session.user });
  } else {
    return res.json({ loggedIn: false });
  }
});

// NOTE :  התנתקות
router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).send("שגיאה בהתנתקות");
    res.clearCookie("connect.sid");
    res.json({ success: true });
  });
});

// NOTE : שאילתה להוספת תפקיד חדש
// OK קוד עובד תקין

router.post("/add_role", (req, res) => {
  const {
    role_name,
    can_manage_users = 0,
    can_view_reports = 0,
    can_assign_leads = 0,
    can_edit_courses = 0,
    can_manage_tasks = 0,
    can_access_all_data = 0,
  } = req.body;

  if (!role_name || typeof role_name !== "string" || role_name.trim() === "")
    return res
      .status(400)
      .json({ Status: false, Error: "שם תפקיד חסר או לא תקין" });

  const checkQuery = "SELECT * FROM roles_permissions WHERE role_name = ?";
  connection.query(checkQuery, [role_name], (checkErr, checkResult) => {
    if (checkErr)
      return res
        .status(500)
        .json({ Status: false, Error: "שגיאת בדיקת כפילות" });
    if (checkResult.length > 0)
      return res
        .status(409)
        .json({ Status: false, Error: "שם תפקיד כבר קיים" });

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
      (err, result) => {
        if (err)
          return res
            .status(500)
            .json({ Status: false, Error: "שגיאת יצירת תפקיד" });

        return res.status(201).json({ Status: true, Result: result });
      }
    );
  });
});

// NOTE : שאילתה לשליפת כל התפקידים
// OK עובד תקין

router.get("/roles", (req, res) => {
  connection.query("SELECT * FROM roles_permissions", (err, results) => {
    if (err)
      return res.status(500).json({ Status: false, Error: "שגיאת שליפה" });
    return res.status(200).json({ Status: true, Roles: results });
  });
});

// NOTE : שאילתה לשליפת תפקיד לפי מזהה
// OK עובד תקין

router.get("/role/:id", (req, res) => {
  const roleId = req.params.id;

  const query = "SELECT * FROM roles_permissions WHERE role_id = ?";
  connection.query(query, [roleId], (err, results) => {
    if (err) {
      return res
        .status(500)
        .json({ Status: false, Error: "שגיאת שליפה מהשרת" });
    }

    if (results.length === 0) {
      return res.status(404).json({ Status: false, Error: "תפקיד לא נמצא" });
    }

    return res.status(200).json({ Status: true, Role: results[0] });
  });
});

// NOTE : שאילתה לעדכון תפקיד לפי מזהה
// OK עובד תקין
router.put("/role/:id", (req, res) => {
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
    WHERE role_id = ?
  `;

  const values = [
    role_name,
    can_manage_users,
    can_view_reports,
    can_assign_leads,
    can_edit_courses,
    can_manage_tasks,
    can_access_all_data,
    active,
    role_id,
  ];

  connection.query(updateQuery, values, (err, result) => {
    if (err) {
      return res
        .status(500)
        .json({ Status: false, Error: "שגיאת עדכון תפקיד" });
    }

    // בדיקה אם התעדכן בפועל
    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ Status: false, Error: "תפקיד לא נמצא לעדכון" });
    }

    return res.status(200).json({ Status: true, Message: "עודכן בהצלחה" });
  });
});

// NOTE : שאילתה לשליפת כל התפקידים הפעילים
// OK עובד תקין
router.get("/active-roles", (req, res) => {
  connection.query(
    "SELECT * FROM roles_permissions WHERE active = 1",
    (err, results) => {
      if (err)
        return res.status(500).json({ Status: false, Error: "שגיאת שליפה" });
      return res.status(200).json({ Status: true, Roles: results });
    }
  );
});
// NOTE : שאילתה לשליפת כל התפקידים הלא פעילים
// OK עובד תקין
router.get("/inactive-roles", (req, res) => {
  connection.query(
    "SELECT * FROM roles_permissions WHERE active = 0",
    (err, results) => {
      if (err)
        return res.status(500).json({ Status: false, Error: "שגיאת שליפה" });
      return res.status(200).json({ Status: true, Roles: results });
    }
  );
});

// NOTE : שאילתה למחיקה לוגית של תפקיד לפי מזהה
// OK עובד תקין
router.put("/delete_role/:id", (req, res) => {
  const roleId = req.params.id;
  const updateQuery =
    "UPDATE roles_permissions SET active = 0 WHERE role_id = ?";

  connection.query(updateQuery, [roleId], (err) => {
    if (err)
      return res.status(500).json({ Status: false, Error: "שגיאת עדכון" });
    return res.status(200).json({
      Status: true,
      Message: "התפקיד הוסר בהצלחה (מחיקה לוגית)",
    });
  });
});

// -------------------------------------------------------------------------------------- //
// צפייה בלוגים – רק למנהל כללי
router.get("/logs", (req, res) => {
  const sql = `
    SELECT 
      events_logs.log_id,
      CONCAT(users.first_name, ' ', users.last_name) AS user_name,
      events_logs.action,
      events_logs.timestamp
    FROM events_logs
    INNER JOIN users ON events_logs.user_id = users.user_id
    ORDER BY events_logs.timestamp DESC`;

  connection.query(sql, (err, result) => {
    if (err) return res.json({ Status: false, Error: "Query Error" });
    return res.json({ Status: true, Result: result });
  });
});

module.exports = { usersRouter: router };

import express from "express";
import dbSingleton from "../utils/dbSingleton.js";
import verifyToken from "../utils/verifyToken.js";

const router = express.Router();
const connection = dbSingleton.getConnection();

// ✅ שליפת כל הפרויקטים
router.get("/", verifyToken, (req, res) => {
  const sql = "SELECT * FROM projects ORDER BY project_id DESC";
  connection.query(sql, (err, result) => {
    if (err) return res.json({ Status: false, Error: err });
    return res.json({ Status: true, Result: result });
  });
});

// ✅ הוספת פרויקט חדש
router.post("/add", verifyToken, (req, res) => {
  const { project_name, project_description, is_active } = req.body;

  if (!project_name || !project_description) {
    return res.json({ Status: false, Error: "נא למלא את כל השדות" });
  }

  const sql = `
    INSERT INTO projects (project_name, project_description, is_active)
    VALUES (?, ?, ?)
  `;
  connection.query(
    sql,
    [project_name, project_description, is_active ?? 1],
    (err, result) => {
      if (err) return res.json({ Status: false, Error: err });
      return res.json({ Status: true, Message: "הפרויקט נוסף בהצלחה" });
    }
  );
});

// ✅ עריכת פרויקט קיים
router.put("/edit/:id", verifyToken, (req, res) => {
  const { id } = req.params;
  const { project_name, project_description, is_active } = req.body;

  const sql = `
    UPDATE projects 
    SET project_name = ?, project_description = ?, is_active = ?
    WHERE project_id = ?
  `;

  connection.query(
    sql,
    [project_name, project_description, is_active, id],
    (err, result) => {
      if (err) return res.json({ Status: false, Error: err });
      return res.json({ Status: true, Message: "הפרויקט עודכן בהצלחה" });
    }
  );
});

// ✅ מחיקה לוגית של פרויקט
router.delete("/delete/:id", verifyToken, (req, res) => {
  const { id } = req.params;
  const sql = `
    UPDATE projects
    SET is_active = 0
    WHERE project_id = ?
  `;
  connection.query(sql, [id], (err, result) => {
    if (err) return res.json({ Status: false, Error: err });
    return res.json({
      Status: true,
      Message: "הפרויקט הועבר לארכיון (מחיקה לוגית)",
    });
  });
});

// ✅ שליפת פרויקטים פעילים בלבד
router.get("/active", verifyToken, (req, res) => {
  const sql = "SELECT * FROM projects WHERE is_active = 1";
  connection.query(sql, (err, result) => {
    if (err) return res.json({ Status: false, Error: err });
    return res.json({ Status: true, Result: result });
  });
});

// ✅ שליפת פרויקטים לא פעילים בלבד
router.get("/inactive", verifyToken, (req, res) => {
  const sql = "SELECT * FROM projects WHERE is_active = 0";
  connection.query(sql, (err, result) => {
    if (err) return res.json({ Status: false, Error: err });
    return res.json({ Status: true, Result: result });
  });
});


// ✅ שליפת פרויקט לפי ID
router.get("/:id", verifyToken, (req, res) => {
  const { id } = req.params;

  const sql = "SELECT * FROM projects WHERE project_id = ?";
  connection.query(sql, [id], (err, result) => {
    if (err) return res.json({ Status: false, Error: err });

    if (result.length === 0) {
      return res.json({ Status: false, Error: "הפרויקט לא נמצא" });
    }

    return res.json({ Status: true, Result: result[0] });
  });
});

export default router;

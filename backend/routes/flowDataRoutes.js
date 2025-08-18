import { Router } from "express";
import dbSingleton from "../utils/dbSingleton.js";

const router = Router();
const connection = dbSingleton.getConnection();

// ✅ החזרת פרויקטים פעילים כ-options ל-Flow
// פורמט התשובה: { options: [ {label: "...", value: "..."}, ... ] }
router.get("/projects", (req, res) => {
  // הגנה מינימלית: דרישת מפתח בקריאה
  const key = (req.query.key || "").trim();
  if (!process.env.FLOW_READ_KEY || key !== process.env.FLOW_READ_KEY) {
    return res.status(401).json({ options: [] });
  }

  const q = (req.query.q || "").trim(); // חיפוש אופציונלי
  const params = [];
  let sql = `
    SELECT project_id AS value, project_name AS label
    FROM projects
    WHERE is_active = 1
  `;
  if (q) {
    sql += ` AND (project_name LIKE ?)`;
    params.push(`%${q}%`);
  }
  sql += ` ORDER BY project_id DESC LIMIT 200`;

  connection.query(sql, params, (err, rows) => {
    if (err) {
      console.error("flows/projects error:", err);
      return res.status(500).json({ options: [] });
    }
    return res.json({ options: rows });
  });
});

export default router;

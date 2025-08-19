import { Router } from "express";
// ✅ ייבוא הקוד המקצועי של ה-DB
import { db } from "../utils/dbSingleton.js";
import verifyToken from "../utils/verifyToken.js";

const router = Router();

// ✅ החזרת פרויקטים פעילים כ-options ל-Flow
// פורמט התשובה: { options: [ {label: "...", value: "..."}, ... ] }
router.get("/projects", async (req, res) => {
  try {
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

    // ✅ שימוש ב-async/await וב-db.query
    const [rows] = await db.query(sql, params);

    return res.json({ options: rows });
  } catch (err) {
    console.error("flows/projects error:", err);
    return res.status(500).json({ options: [] });
  }
});

export default router;

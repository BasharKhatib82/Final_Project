import { Router } from "express";
import { db } from "../utils/dbSingleton.js";

const router = Router();

/**
 * ✅ החזרת רשימת פרויקטים פעילים בפורמט מותאם ל־Flow
 * GET /flows/projects?key=API_KEY&q=searchTerm
 * תשובה: { options: [ {label: "...", value: "..."}, ... ] }
 */
router.get("/projects", async (req, res) => {
  try {
    // 🔐 אימות בסיסי ע"י מפתח קריאה (API key)
    const key = (req.query.key || "").trim();
    if (!process.env.FLOW_READ_KEY || key !== process.env.FLOW_READ_KEY) {
      return res.status(401).json({
        success: false,
        options: [],
        message: "Unauthorized: missing or invalid key",
      });
    }

    // 🔎 תמיכה בחיפוש אופציונלי
    const q = (req.query.q || "").trim();
    const params = [];
    let sql = `
      SELECT project_id AS value, project_name AS label
      FROM projects
      WHERE is_active = 1
    `;

    if (q) {
      sql += " AND project_name LIKE ?";
      params.push(`%${q}%`);
    }

    sql += " ORDER BY project_id DESC LIMIT 200";

    // 📊 שליפה מהמסד
    const [rows] = await db.query(sql, params);

    return res.json({
      success: true,
      options: rows,
    });
  } catch (err) {
    console.error("❌ flows/projects error:", err);
    return res.status(500).json({
      success: false,
      options: [],
      message: "Server error while fetching projects",
    });
  }
});

export default router;

import express from "express";
import { db } from "../utils/dbSingleton.js";
import logAction from "../utils/logAction.js";
import verifyToken from "../utils/verifyToken.js";

const router = express.Router();

// ✅ ולידציה בסיסית
const isValidEmail = (email) => /\S+@\S+\.\S+/.test(email);
const validStatuses = ["חדש", "בטיפול", "טופל", "בוטלה"];

// ✅ שליפת כל הפניות
router.get("/", verifyToken, async (req, res) => {
  const sql = `
    SELECT 
      l.*, c.first_name, c.last_name, c.email, c.city,
      p.project_name,
      u.first_name AS rep_first_name, u.last_name AS rep_last_name
    FROM leads l
    JOIN clients c ON l.phone_number = c.phone_number
    JOIN projects p ON l.project_id = p.project_id
    LEFT JOIN users u ON l.user_id = u.user_id
    ORDER BY l.lead_id DESC
  `;
  try {
    const [rows] = await db.query(sql);
    res.json({ Status: true, Result: rows });
  } catch (err) {
    console.error("❌ שגיאה בשליפת הפניות:", err);
    res.status(500).json({ Status: false, Error: "שגיאה בשרת" });
  }
});

// ✅ שליפת פנייה לפי ID
router.get("/:id", verifyToken, async (req, res) => {
  const sql = `
    SELECT 
      l.*, c.first_name, c.last_name, c.email, c.city,
      p.project_name,
      u.first_name AS rep_first_name, u.last_name AS rep_last_name
    FROM leads l
    JOIN clients c ON l.phone_number = c.phone_number
    JOIN projects p ON l.project_id = p.project_id
    LEFT JOIN users u ON l.user_id = u.user_id
    WHERE l.lead_id = ?
  `;
  try {
    const [rows] = await db.query(sql, [req.params.id]);
    if (rows.length === 0)
      return res.status(404).json({ Status: false, Error: "פנייה לא נמצאה" });
    res.json({ Status: true, Result: rows[0] });
  } catch (err) {
    console.error("❌ שגיאה בשליפת פנייה לפי ID:", err);
    res.status(500).json({ Status: false, Error: "שגיאה בשרת" });
  }
});

// ✅ יצירת פנייה חדשה (עם טרנזקציה)
router.post("/add", verifyToken, async (req, res) => {
  const {
    phone_number,
    project_id,
    status,
    first_name,
    last_name,
    email,
    city,
  } = req.body;

  if (!phone_number || !project_id || !status)
    return res
      .status(400)
      .json({ Status: false, Error: "נא למלא את כל השדות החובה" });

  if (!validStatuses.includes(status))
    return res.status(400).json({ Status: false, Error: "סטטוס לא חוקי" });

  if (email && !isValidEmail(email))
    return res.status(400).json({ Status: false, Error: "אימייל לא תקין" });

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const [clients] = await conn.query(
      "SELECT * FROM clients WHERE phone_number = ?",
      [phone_number]
    );
    if (clients.length === 0) {
      await conn.query(
        `INSERT INTO clients (phone_number, first_name, last_name, email, city) VALUES (?, ?, ?, ?, ?)`,
        [phone_number, first_name, last_name, email, city]
      );
    }

    await conn.query(
      `INSERT INTO leads (phone_number, project_id, status, user_id) VALUES (?, ?, ?, ?)`,
      [phone_number, project_id, status, req.user.user_id]
    );

    await conn.commit();

    logAction("הוספת פנייה חדשה", req.user.user_id)(req, res, () => {});
    res.json({ Status: true, Message: "הפנייה נשמרה בהצלחה" });
  } catch (err) {
    await conn.rollback();
    console.error("❌ שגיאה ביצירת פנייה:", err);
    res.status(500).json({ Status: false, Error: "שגיאה בשרת" });
  } finally {
    conn.release();
  }
});

// ✅ עדכון פנייה (עם טרנזקציה)
router.put("/edit/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  const {
    phone_number,
    first_name,
    last_name,
    email,
    city,
    status,
    project_id,
    user_id,
  } = req.body;

  if (!phone_number || !first_name || !last_name || !status || !project_id)
    return res
      .status(400)
      .json({ Status: false, Error: "נא למלא את כל השדות הנדרשים" });

  if (!validStatuses.includes(status))
    return res.status(400).json({ Status: false, Error: "סטטוס לא חוקי" });

  if (email && !isValidEmail(email))
    return res.status(400).json({ Status: false, Error: "אימייל לא תקין" });

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const [client] = await conn.query(
      "SELECT * FROM clients WHERE phone_number = ?",
      [phone_number]
    );
    if (client.length > 0) {
      await conn.query(
        `UPDATE clients SET first_name=?, last_name=?, email=?, city=? WHERE phone_number=?`,
        [first_name, last_name, email, city, phone_number]
      );
    } else {
      await conn.query(
        `INSERT INTO clients (phone_number, first_name, last_name, email, city) VALUES (?, ?, ?, ?, ?)`,
        [phone_number, first_name, last_name, email, city]
      );
    }

    const [update] = await conn.query(
      `UPDATE leads SET status=?, project_id=?, phone_number=?, user_id=? WHERE lead_id=?`,
      [status, project_id, phone_number, user_id || null, id]
    );

    if (update.affectedRows === 0) throw new Error("Lead not found");

    await conn.commit();

    logAction(`עדכון פנייה #${id}`, req.user.user_id)(req, res, () => {});
    res.json({ Status: true, Message: "הפנייה עודכנה בהצלחה" });
  } catch (err) {
    await conn.rollback();
    console.error("❌ שגיאה בעדכון פנייה:", err);
    res.status(500).json({ Status: false, Error: "שגיאה בשרת" });
  } finally {
    conn.release();
  }
});

// ✅ עדכון נציג
router.put("/update-rep/:id", verifyToken, async (req, res) => {
  try {
    const [result] = await db.query(
      "UPDATE leads SET user_id=? WHERE lead_id=?",
      [req.body.user_id || null, req.params.id]
    );
    if (result.affectedRows === 0)
      return res.status(404).json({ Status: false, Error: "פנייה לא נמצאה" });

    logAction(`עדכון נציג לפנייה #${req.params.id}`, req.user.user_id)(
      req,
      res,
      () => {}
    );
    res.json({ Status: true, Message: "נציג עודכן בהצלחה" });
  } catch (err) {
    console.error("❌ שגיאה בעדכון נציג:", err);
    res.status(500).json({ Status: false, Error: "שגיאה בשרת" });
  }
});

// ✅ מחיקה לוגית
router.delete("/delete/:id", verifyToken, async (req, res) => {
  try {
    const [result] = await db.query(
      "UPDATE leads SET status='בוטלה' WHERE lead_id=?",
      [req.params.id]
    );
    if (result.affectedRows === 0)
      return res.status(404).json({ Status: false, Error: "פנייה לא נמצאה" });

    logAction(`מחיקת פנייה #${req.params.id}`, req.user.user_id)(
      req,
      res,
      () => {}
    );
    res.json({ Status: true, Message: "הפנייה סומנה כמבוטלת" });
  } catch (err) {
    console.error("❌ שגיאה במחיקת פנייה:", err);
    res.status(500).json({ Status: false, Error: "שגיאה בשרת" });
  }
});

// ✅ עדכון סטטוס
router.put("/update-status/:id", verifyToken, async (req, res) => {
  try {
    const [result] = await db.query(
      "UPDATE leads SET status=? WHERE lead_id=?",
      [req.body.status, req.params.id]
    );
    if (result.affectedRows === 0)
      return res.status(404).json({ Status: false, Error: "פנייה לא נמצאה" });

    logAction(`עדכון סטטוס לפנייה #${req.params.id}`, req.user.user_id)(
      req,
      res,
      () => {}
    );
    res.json({ Status: true, Message: "סטטוס עודכן בהצלחה" });
  } catch (err) {
    console.error("❌ שגיאה בעדכון סטטוס:", err);
    res.status(500).json({ Status: false, Error: "שגיאה בשרת" });
  }
});

// ✅ שיוך מרוכז
router.put("/bulk-assign", verifyToken, async (req, res) => {
  const { leadIds, user_id } = req.body;
  if (!Array.isArray(leadIds) || leadIds.length === 0)
    return res.status(400).json({ Status: false, Error: "לא נבחרו פניות" });

  try {
    await db.query("UPDATE leads SET user_id=? WHERE lead_id IN (?)", [
      user_id || null,
      leadIds,
    ]);

    logAction(
      `שיוך ${leadIds.length} פניות לנציג ${user_id}`,
      req.user.user_id
    )(req, res, () => {});
    res.json({ Status: true, Message: "השיוך בוצע בהצלחה" });
  } catch (err) {
    console.error("❌ שגיאה בשיוך פניות:", err);
    res.status(500).json({ Status: false, Error: "שגיאה בשרת" });
  }
});

export default router;

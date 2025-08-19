import express from "express";
import { db } from "../utils/dbSingleton.js";
import verifyToken from "../utils/verifyToken.js";
import logAction from "../utils/logAction.js";

const router = express.Router();

// ✅ שליפת כל הפניות (כולל פרויקט, לקוח ונציג מטפל)
router.get("/", verifyToken, async (req, res) => {
  const sql = `
    SELECT 
      l.*,
      c.first_name, 
      c.last_name, 
      c.email, 
      c.city, 
      p.project_name,
      u.first_name AS rep_first_name,
      u.last_name AS rep_last_name
    FROM leads l
    JOIN clients c ON l.phone_number = c.phone_number
    JOIN projects p ON l.project_id = p.project_id
    LEFT JOIN users u ON l.user_id = u.user_id
    ORDER BY l.lead_id DESC
  `;
  try {
    const [result] = await db.query(sql);
    res.json({ Status: true, Result: result });
  } catch (err) {
    console.error("שגיאה בשליפת הפניות:", err);
    res.status(500).json({ Status: false, Error: "שגיאה בשרת" });
  }
});

// ✅ שליפת פנייה לפי ID
router.get("/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  const sql = `
    SELECT 
      l.*, 
      c.first_name, c.last_name, c.email, c.city, 
      p.project_name,
      u.first_name AS rep_first_name,
      u.last_name AS rep_last_name
    FROM leads l
    JOIN clients c ON l.phone_number = c.phone_number
    JOIN projects p ON l.project_id = p.project_id
    LEFT JOIN users u ON l.user_id = u.user_id
    WHERE l.lead_id = ?
  `;
  try {
    const [result] = await db.query(sql, [id]);
    if (result.length === 0) {
      return res.status(404).json({ Status: false, Error: "פנייה לא נמצאה" });
    }
    res.json({ Status: true, Result: result[0] });
  } catch (err) {
    console.error("שגיאה בשליפת פנייה לפי ID:", err);
    res.status(500).json({ Status: false, Error: "שגיאה בשרת" });
  }
});

// ✅ יצירת פנייה חדשה (כולל יצירת לקוח אם לא קיים)
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

  if (!phone_number || !project_id || !status) {
    return res
      .status(400)
      .json({ Status: false, Error: "נא למלא את כל השדות החובה" });
  }

  const checkClientSQL = `SELECT * FROM clients WHERE phone_number = ?`;
  const insertClientSQL = `
    INSERT INTO clients (phone_number, first_name, last_name, email, city)
    VALUES (?, ?, ?, ?, ?)
  `;
  const insertLeadSQL = `
    INSERT INTO leads (phone_number, project_id, status, user_id)
    VALUES (?, ?, ?, ?)
  `;

  try {
    const [clients] = await db.query(checkClientSQL, [phone_number]);

    if (clients.length === 0) {
      await db.query(insertClientSQL, [
        phone_number,
        first_name,
        last_name,
        email,
        city,
      ]);
    }

    await db.query(insertLeadSQL, [
      phone_number,
      project_id,
      status,
      req.user.user_id,
    ]);

    logAction("הוספת פנייה חדשה")(req, res, () => {});
    res.json({ Status: true, Message: "הפנייה נשמרה בהצלחה" });
  } catch (err) {
    console.error("שגיאה ביצירת פנייה חדשה:", err);
    res.status(500).json({ Status: false, Error: "שגיאה בשרת" });
  }
});

// ✅ עדכון פנייה כולל שינוי טלפון ופרטי לקוח
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

  if (!phone_number || !first_name || !last_name || !status || !project_id) {
    return res
      .status(400)
      .json({ Status: false, Error: "נא למלא את כל השדות הנדרשים" });
  }

  const checkClientSQL = `SELECT * FROM clients WHERE phone_number = ?`;
  const updateClientSQL = `
    UPDATE clients
    SET first_name = ?, last_name = ?, email = ?, city = ?
    WHERE phone_number = ?
  `;
  const insertClientSQL = `
    INSERT INTO clients (phone_number, first_name, last_name, email, city)
    VALUES (?, ?, ?, ?, ?)
  `;
  const updateLeadSQL = `
    UPDATE leads
    SET status = ?, project_id = ?, phone_number = ?, user_id = ?
    WHERE lead_id = ?
  `;

  try {
    const [clientResult] = await db.query(checkClientSQL, [phone_number]);

    if (clientResult.length > 0) {
      await db.query(updateClientSQL, [
        first_name,
        last_name,
        email,
        city,
        phone_number,
      ]);
    } else {
      await db.query(insertClientSQL, [
        phone_number,
        first_name,
        last_name,
        email,
        city,
      ]);
    }

    await db.query(updateLeadSQL, [
      status,
      project_id,
      phone_number,
      user_id || null,
      id,
    ]);

    logAction(`עדכון פנייה #${id}`)(req, res, () => {});
    res.json({ Status: true, Message: "הפנייה עודכנה בהצלחה" });
  } catch (err) {
    console.error("שגיאה בעדכון פנייה:", err);
    res.status(500).json({ Status: false, Error: "שגיאה בשרת" });
  }
});

// ✅ עדכון נציג מטפל לפנייה
router.put("/update-rep/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  const { user_id } = req.body;

  const sql = `
    UPDATE leads
    SET user_id = ?
    WHERE lead_id = ?
  `;

  try {
    await db.query(sql, [user_id || null, id]);

    logAction(`עדכון נציג לפנייה #${id}`)(req, res, () => {});
    res.json({ Status: true, Message: "נציג עודכן בהצלחה" });
  } catch (err) {
    console.error("שגיאה בעדכון נציג:", err);
    res.status(500).json({ Status: false, Error: "שגיאה בשרת" });
  }
});

// ✅ שליפת לקוח לפי טלפון (לטופס AddLead)
router.get("/client/by-phone/:phone", verifyToken, async (req, res) => {
  const { phone } = req.params;
  const sql = `SELECT * FROM clients WHERE phone_number = ?`;
  try {
    const [result] = await db.query(sql, [phone]);
    if (result.length === 0) {
      return res.status(404).json({ Status: false, Error: "לא נמצא לקוח" });
    }
    res.json({ Status: true, Result: result[0] });
  } catch (err) {
    console.error("שגיאה בשליפת לקוח לפי טלפון:", err);
    res.status(500).json({ Status: false, Error: "שגיאה בשרת" });
  }
});

// ✅ מחיקה לוגית של פנייה – שינוי סטטוס ל"בוטלה"
router.delete("/delete/:id", verifyToken, async (req, res) => {
  const { id } = req.params;

  const sql = `
    UPDATE leads
    SET status = 'בוטלה'
    WHERE lead_id = ?
  `;

  try {
    await db.query(sql, [id]);
    logAction(`מחיקת פנייה (לוגית) #${id}`)(req, res, () => {});
    res.json({ Status: true, Message: "הפנייה סומנה כמבוטלת" });
  } catch (err) {
    console.error("שגיאה במחיקת פנייה:", err);
    res.status(500).json({ Status: false, Error: "שגיאה במחיקה" });
  }
});

// ✅ עדכון סטטוס פנייה בלבד
router.put("/update-status/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const sql = `
    UPDATE leads
    SET status = ?
    WHERE lead_id = ?
  `;

  try {
    await db.query(sql, [status, id]);
    logAction(`עדכון סטטוס לפנייה #${id}`)(req, res, () => {});
    res.json({ Status: true, Message: "סטטוס עודכן בהצלחה" });
  } catch (err) {
    console.error("שגיאה בעדכון סטטוס:", err);
    res.status(500).json({ Status: false, Error: "שגיאה בשרת" });
  }
});

router.put("/bulk-assign", verifyToken, async (req, res) => {
  const { leadIds, user_id } = req.body;

  if (!leadIds || leadIds.length === 0) {
    return res.status(400).json({ Status: false, Error: "לא נבחרו פניות" });
  }

  const sql = `
    UPDATE leads
    SET user_id = ?
    WHERE lead_id IN (?)
  `;

  try {
    await db.query(sql, [user_id || null, leadIds]);
    logAction(`שיוך ${leadIds.length} פניות לנציג ${user_id}`)(
      req,
      res,
      () => {}
    );
    res.json({ Status: true, Message: "השיוך בוצע בהצלחה" });
  } catch (err) {
    console.error("שגיאה בשיוך פניות:", err);
    res.status(500).json({ Status: false, Error: "שגיאה בשרת" });
  }
});

export default router;

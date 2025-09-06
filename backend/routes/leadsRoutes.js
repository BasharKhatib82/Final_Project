import express from "express";
import { db } from "../utils/dbSingleton.js";
import logAction from "../utils/logAction.js";
import verifyToken from "../utils/verifyToken.js";
import { validateAndSanitizeEmail } from "../utils/validateAndSanitizeEmail.js";

const router = express.Router();

// החלת אימות טוקן על כל הראוטים
router.use(verifyToken);

// ✅ סטטוסים חוקיים לפנייה
const validStatuses = ["חדש", "בטיפול", "טופל", "בוטלה"];

/************************************************
 *               שליפת כל הפניות                *
 ************************************************/
router.get("/", async (_req, res) => {
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
    const [leadsList] = await db.query(sql);
    return res.json({ success: true, data: leadsList });
  } catch (err) {
    console.error("❌ שגיאה בשליפת הפניות:", err);
    return res.status(500).json({ success: false, message: "שגיאה בשרת" });
  }
});

/************************************************
 *              שליפת פנייה לפי ID              *
 ************************************************/
router.get("/:id", async (req, res) => {
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
    if (rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "פנייה לא נמצאה" });
    }
    return res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error("❌ שגיאה בשליפת פנייה לפי ID:", err);
    return res.status(500).json({ success: false, message: "שגיאה בשרת" });
  }
});

/************************************************
 *     יצירת פנייה חדשה (לקוחות + פניות)        *
 *               (עם טרנזקציה)                  *
 ************************************************/
router.post("/add", async (req, res) => {
  let { phone_number, project_id, status, first_name, last_name, email, city } =
    req.body;

  // ניקוי בסיסי
  phone_number = (phone_number ?? "").toString().trim();
  project_id = Number(project_id);
  status = (status ?? "").toString().trim();
  first_name = (first_name ?? "").toString().trim();
  last_name = (last_name ?? "").toString().trim();
  email = (email ?? "").toString().trim();
  city = (city ?? "").toString().trim();

  if (!phone_number || !project_id || !status) {
    return res
      .status(400)
      .json({ success: false, message: "נא למלא את כל השדות החובה" });
  }

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: "סטטוס לא חוקי" });
  }

  // אימייל אופציונלי – אם נשלח, נבדוק תקינות
  if (email) {
    try {
      email = validateAndSanitizeEmail(email);
    } catch (e) {
      return res
        .status(400)
        .json({ success: false, message: e?.message || "אימייל לא תקין" });
    }
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // בדיקה אם קיים לקוח לפי טלפון
    const [clients] = await conn.query(
      "SELECT * FROM clients WHERE phone_number = ?",
      [phone_number]
    );

    if (clients.length === 0) {
      const [insertClient] = await conn.query(
        `INSERT INTO clients (phone_number, first_name, last_name, email, city)
         VALUES (?, ?, ?, ?, ?)`,
        [phone_number, first_name, last_name, email || null, city || null]
      );
      /**
       * affectedRows – כמה שורות הושפעו מה־INSERT. ציפייה: 1.
       */
      if (insertClient.affectedRows !== 1) {
        throw new Error("יצירת לקוח נכשלה");
      }
    } else {
      // אם יש – נעדכן פרטים בסיסיים במידת הצורך (לא חובה, אך שימושי)
      await conn.query(
        `UPDATE clients
         SET first_name = COALESCE(?, first_name),
             last_name  = COALESCE(?, last_name),
             email      = COALESCE(?, email),
             city       = COALESCE(?, city)
         WHERE phone_number = ?`,
        [
          first_name || null,
          last_name || null,
          email || null,
          city || null,
          phone_number,
        ]
      );
    }

    const [insertLead] = await conn.query(
      `INSERT INTO leads (phone_number, project_id, status, user_id)
       VALUES (?, ?, ?, ?)`,
      [phone_number, project_id, status, req.user.user_id]
    );

    if (insertLead.affectedRows !== 1) {
      throw new Error("שמירת פנייה נכשלה");
    }

    await conn.commit();

    logAction("הוספת פנייה חדשה", req.user.user_id)(req, res, () => {});
    return res.json({ success: true, message: "הפנייה נשמרה בהצלחה" });
  } catch (err) {
    await conn.rollback();
    console.error("❌ שגיאה ביצירת פנייה:", err);
    return res.status(500).json({ success: false, message: "שגיאה בשרת" });
  } finally {
    conn.release();
  }
});

/************************************************
 *             עדכון פנייה (טרנזקציה)           *
 ************************************************/
router.put("/edit/:id", async (req, res) => {
  const { id } = req.params;

  let {
    phone_number,
    first_name,
    last_name,
    email,
    city,
    status,
    project_id,
    user_id,
  } = req.body;

  // ניקוי
  phone_number = (phone_number ?? "").toString().trim();
  first_name = (first_name ?? "").toString().trim();
  last_name = (last_name ?? "").toString().trim();
  email = (email ?? "").toString().trim();
  city = (city ?? "").toString().trim();
  status = (status ?? "").toString().trim();
  project_id = Number(project_id);
  user_id = user_id ? Number(user_id) : null;

  if (!phone_number || !first_name || !last_name || !status || !project_id) {
    return res
      .status(400)
      .json({ success: false, message: "נא למלא את כל השדות הנדרשים" });
  }

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: "סטטוס לא חוקי" });
  }

  if (email) {
    try {
      email = validateAndSanitizeEmail(email);
    } catch (e) {
      return res
        .status(400)
        .json({ success: false, message: e?.message || "אימייל לא תקין" });
    }
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const [client] = await conn.query(
      "SELECT * FROM clients WHERE phone_number = ?",
      [phone_number]
    );

    if (client.length > 0) {
      const [updateClient] = await conn.query(
        `UPDATE clients
         SET first_name = ?, last_name = ?, email = ?, city = ?
         WHERE phone_number = ?`,
        [first_name, last_name, email || null, city || null, phone_number]
      );
      // affectedRows כאן לא הכרחי לעצירה (ייתכן שאין שינוי בפועל)
    } else {
      const [insertClient] = await conn.query(
        `INSERT INTO clients (phone_number, first_name, last_name, email, city)
         VALUES (?, ?, ?, ?, ?)`,
        [phone_number, first_name, last_name, email || null, city || null]
      );
      if (insertClient.affectedRows !== 1) {
        throw new Error("שמירת לקוח נכשלה");
      }
    }

    const [updateLead] = await conn.query(
      `UPDATE leads
       SET status = ?, project_id = ?, phone_number = ?, user_id = ?
       WHERE lead_id = ?`,
      [status, project_id, phone_number, user_id, id]
    );

    /**
     * affectedRows – אם 0: לא נמצאה פנייה לעדכון.
     */
    if (updateLead.affectedRows === 0) {
      throw new Error("פנייה לא נמצאה לעדכון");
    }

    await conn.commit();

    logAction(`עדכון פנייה #${id}`, req.user.user_id)(req, res, () => {});
    return res.json({ success: true, message: "הפנייה עודכנה בהצלחה" });
  } catch (err) {
    await conn.rollback();
    console.error("❌ שגיאה בעדכון פנייה:", err);
    return res.status(500).json({ success: false, message: "שגיאה בשרת" });
  } finally {
    conn.release();
  }
});

/************************************************
 *                 עדכון נציג לפנייה            *
 ************************************************/
router.put("/update-rep/:id", async (req, res) => {
  const leadId = req.params.id;
  const repUserId = req.body.user_id ? Number(req.body.user_id) : null;

  try {
    const [result] = await db.query(
      "UPDATE leads SET user_id = ? WHERE lead_id = ?",
      [repUserId, leadId]
    );
    /**
     * affectedRows – אם 0: לא נמצאה פנייה.
     */
    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "פנייה לא נמצאה" });
    }

    logAction(`עדכון נציג לפנייה #${leadId}`, req.user.user_id)(
      req,
      res,
      () => {}
    );
    return res.json({ success: true, message: "נציג עודכן בהצלחה" });
  } catch (err) {
    console.error("❌ שגיאה בעדכון נציג:", err);
    return res.status(500).json({ success: false, message: "שגיאה בשרת" });
  }
});

/************************************************
 *                   מחיקה לוגית                *
 ************************************************/
router.delete("/delete/:id", async (req, res) => {
  const leadId = req.params.id;

  try {
    const [result] = await db.query(
      "UPDATE leads SET status = 'בוטלה' WHERE lead_id = ?",
      [leadId]
    );
    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "פנייה לא נמצאה" });
    }

    logAction(`מחיקת פנייה #${leadId}`, req.user.user_id)(req, res, () => {});
    return res.json({ success: true, message: "הפנייה סומנה כמבוטלת" });
  } catch (err) {
    console.error("❌ שגיאה במחיקת פנייה:", err);
    return res.status(500).json({ success: false, message: "שגיאה בשרת" });
  }
});

/************************************************
 *                  עדכון סטטוס                 *
 ************************************************/
router.put("/update-status/:id", async (req, res) => {
  const leadId = req.params.id;
  const newStatus = (req.body.status ?? "").toString().trim();

  if (!validStatuses.includes(newStatus)) {
    return res.status(400).json({ success: false, message: "סטטוס לא חוקי" });
  }

  try {
    const [result] = await db.query(
      "UPDATE leads SET status = ? WHERE lead_id = ?",
      [newStatus, leadId]
    );
    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "פנייה לא נמצאה" });
    }

    logAction(`עדכון סטטוס לפנייה #${leadId}`, req.user.user_id)(
      req,
      res,
      () => {}
    );
    return res.json({ success: true, message: "סטטוס עודכן בהצלחה" });
  } catch (err) {
    console.error("❌ שגיאה בעדכון סטטוס:", err);
    return res.status(500).json({ success: false, message: "שגיאה בשרת" });
  }
});

/************************************************
 *                  שיוך מרוכז                  *
 ************************************************/
router.put("/bulk-assign", async (req, res) => {
  const { leadIds, user_id } = req.body;

  /**
   * Array.isArray – פונקציה פנימית של JS שבודקת אם הערך הוא מערך.
   * אם לא מערך או ריק – מחזירים 400.
   */
  if (!Array.isArray(leadIds) || leadIds.length === 0) {
    return res.status(400).json({ success: false, message: "לא נבחרו פניות" });
  }

  try {
    const [result] = await db.query(
      "UPDATE leads SET user_id = ? WHERE lead_id IN (?)",
      [user_id || null, leadIds]
    );

    logAction(
      `שיוך ${leadIds.length} פניות לנציג ${user_id ?? "ללא"}`,
      req.user.user_id
    )(req, res, () => {});

    return res.json({
      success: true,
      message: "השיוך בוצע בהצלחה",
      data: { affected: result?.affectedRows ?? 0 }, // אינפורמטיבי
    });
  } catch (err) {
    console.error("❌ שגיאה בשיוך פניות:", err);
    return res.status(500).json({ success: false, message: "שגיאה בשרת" });
  }
});

export default router;

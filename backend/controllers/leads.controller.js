// backend\controllers\leads.controller.js

import { db } from "../utils/dbSingleton.js";
import logAction from "../utils/logAction.js";
import { validateAndSanitizeEmail } from "../utils/validateAndSanitizeEmail.js";
import { isValidLeadStatus } from "../utils/leadsHelpers.js";
import {
  isILPhone10,
  isPositiveInt,
  isNineDigitId,
} from "../utils/fieldValidators.js";

/**
 * data_scopeשליפת פניות עם תמיכה ב־
 * ---------------------------------
 *  (req.user) מקבל : משתמש מחובר
 *   - data_scope_all = 1 → מחזיר את כל הפניות.
 *   - data_scope_self = 1 → מחזיר רק את הפניות של המשתמש עצמו.
 *
 * מחזיר: מערך פניות כולל פרטי לקוח, פרויקט ונציג.
 */

export async function listLeads(req, res) {
  const user = req.user;

  let where = "";
  if (user?.data_scope_self === 1 && user?.data_scope_all !== 1) {
    // משתמש מוגבל → רואה רק את עצמו
    where = `WHERE l.user_id = ${db.escape(user.user_id)}`;
  }

  const sql = `
    SELECT 
      l.*, 
      c.first_name, c.last_name, c.email, c.city,
      p.project_name,
      u.first_name AS rep_first_name, u.last_name AS rep_last_name
    FROM leads l
    JOIN clients c ON l.phone_number = c.phone_number
    JOIN projects p ON l.project_id = p.project_id
    LEFT JOIN users u ON l.user_id = u.user_id
    ${where}
    ORDER BY l.lead_id DESC
  `;

  try {
    const [rows] = await db.query(sql);
    return res.json({ success: true, data: rows });
  } catch (err) {
    console.error("listLeads:", err);
    return res.status(500).json({ success: false, message: "שגיאה בשרת" });
  }
}

/**
 * ID שליפת פנייה לפי
 * מקבל: :id
 * מחזיר: אובייקט פנייה
 */
export async function getLeadById(req, res) {
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
    console.error("getLeadById:", err);
    return res.status(500).json({ success: false, message: "שגיאה בשרת" });
  }
}

/**
 * יצירת פנייה חדשה (לקוח + פנייה)
 * מקבל: { phone_number, project_id, first_name?, last_name?, email?, city? }
 * מחזיר: הודעת הצלחה/שגיאה
 */
export async function addLead(req, res) {
  let { phone_number, project_id, first_name, last_name, email, city } =
    req.body;

  // נרמול
  phone_number = String(phone_number ?? "").trim();
  first_name = String(first_name ?? "").trim();
  last_name = String(last_name ?? "").trim();
  email = String(email ?? "").trim();
  city = String(city ?? "").trim();
  project_id = Number(project_id);

  // חובה
  if (!phone_number || !project_id) {
    return res
      .status(400)
      .json({ success: false, message: "נא למלא את כל השדות החובה" });
  }
  if (!isILPhone10(phone_number)) {
    return res.status(400).json({
      success: false,
      message: "מספר טלפון חייב להיות 10 ספרות ולהתחיל ב־05",
    });
  }
  if (!isPositiveInt(project_id)) {
    return res
      .status(400)
      .json({ success: false, message: "מזהה פרויקט חייב להיות מספר חיובי" });
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

    // לקוח לפי טלפון
    const [clientRows] = await conn.query(
      "SELECT phone_number FROM clients WHERE phone_number = ?",
      [phone_number]
    );

    if (clientRows.length === 0) {
      const [insClient] = await conn.query(
        `INSERT INTO clients (phone_number, first_name, last_name, email, city)
         VALUES (?, ?, ?, ?, ?)`,
        [
          phone_number,
          first_name || null,
          last_name || null,
          email || null,
          city || null,
        ]
      );
      if (insClient.affectedRows !== 1) throw new Error("יצירת לקוח נכשלה");
    } else {
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

    // יצירת פנייה
    const [insLead] = await conn.query(
      `INSERT INTO leads (phone_number, project_id, user_id)
       VALUES (?, ?, ?)`,
      [phone_number, project_id, req.user.user_id] // מזהה משתמש של הנציג המחובר
    );
    if (insLead.affectedRows !== 1) throw new Error("שמירת פנייה נכשלה");

    await conn.commit();

    logAction("הוספת פנייה חדשה", req.user.user_id)(req, res, () => {});
    return res.json({ success: true, message: "הפנייה נשמרה בהצלחה" });
  } catch (err) {
    await conn.rollback();
    console.error("addLead:", err);
    return res.status(500).json({ success: false, message: "שגיאה בשרת" });
  } finally {
    conn.release();
  }
}

export async function getClientByPhone(req, res) {
  try {
    const { phone } = req.params;
    if (!phone) {
      return res
        .status(400)
        .json({ success: false, message: "חסר מספר טלפון" });
    }

    const [rows] = await db.query(
      "SELECT * FROM clients WHERE phone = ? LIMIT 1",
      [phone]
    );

    if (!rows.length) {
      return res.status(404).json({ success: false, message: "לא נמצא לקוח" });
    }

    return res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error("getClientByPhone:", err);
    return res.status(500).json({ success: false, message: "שגיאת שרת" });
  }
}

/**
 * עדכון פנייה
 * מקבל: :id, ובגוף: phone_number, first_name, last_name, email?, city?, status, project_id, user_id?
 * מחזיר: הודעת הצלחה/שגיאה
 */
export async function editLead(req, res) {
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

  // נרמול
  phone_number = String(phone_number ?? "").trim();
  first_name = String(first_name ?? "").trim();
  last_name = String(last_name ?? "").trim();
  email = String(email ?? "").trim();
  city = String(city ?? "").trim();
  status = String(status ?? "").trim();
  project_id = Number(project_id);
  user_id = user_id != null ? String(user_id).trim() : null;

  // חובה
  if (!phone_number || !first_name || !last_name || !status || !project_id) {
    return res
      .status(400)
      .json({ success: false, message: "נא למלא את כל השדות הנדרשים" });
  }
  if (!isILPhone10(phone_number)) {
    return res.status(400).json({
      success: false,
      message: "מספר טלפון חייב להיות 10 ספרות ולהתחיל ב 05",
    });
  }
  if (!isValidLeadStatus(status)) {
    return res.status(400).json({ success: false, message: "סטטוס לא חוקי" });
  }
  if (!isPositiveInt(project_id)) {
    return res
      .status(400)
      .json({ success: false, message: "מזהה פרויקט חייב להיות מספר חיובי" });
  }
  if (user_id && !isNineDigitId(user_id)) {
    return res.status(400).json({
      success: false,
      message: "תעודת זהות של הנציג חייב להיות מספר בן 9 ספרות",
    });
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

    // עדכון/יצירת לקוח
    const [client] = await conn.query(
      "SELECT phone_number FROM clients WHERE phone_number = ?",
      [phone_number]
    );

    if (client.length > 0) {
      await conn.query(
        `UPDATE clients
         SET first_name = ?, last_name = ?, email = ?, city = ?
         WHERE phone_number = ?`,
        [first_name, last_name, email || null, city || null, phone_number]
      );
    } else {
      const [insClient] = await conn.query(
        `INSERT INTO clients (phone_number, first_name, last_name, email, city)
         VALUES (?, ?, ?, ?, ?)`,
        [phone_number, first_name, last_name, email || null, city || null]
      );
      if (insClient.affectedRows !== 1) throw new Error("שמירת לקוח נכשלה");
    }

    // עדכון פנייה
    const [updLead] = await conn.query(
      `UPDATE leads
       SET status = ?, project_id = ?, phone_number = ?, user_id = ?
       WHERE lead_id = ?`,
      [status, project_id, phone_number, user_id ? user_id : null, id]
    );

    if (updLead.affectedRows === 0) {
      throw new Error("פנייה לא נמצאה לעדכון");
    }

    await conn.commit();

    logAction(`עדכון פנייה #${id}`, req.user.user_id)(req, res, () => {});
    return res.json({ success: true, message: "הפנייה עודכנה בהצלחה" });
  } catch (err) {
    await conn.rollback();
    console.error("editLead:", err);
    return res.status(500).json({ success: false, message: "שגיאה בשרת" });
  } finally {
    conn.release();
  }
}

/**
 * עדכון נציג לפנייה
 * מקבל: :id, { user_id }
 */
export async function updateLeadRep(req, res) {
  const leadId = req.params.id;
  const repUserId =
    req.body.user_id != null ? String(req.body.user_id).trim() : null;

  if (repUserId && !isNineDigitId(repUserId)) {
    return res.status(400).json({
      success: false,
      message: "תעודת זהות של הנציג חייב להיות מספר בן 9 ספרות",
    });
  }

  try {
    const [result] = await db.query(
      "UPDATE leads SET user_id = ? WHERE lead_id = ?",
      [repUserId || null, leadId]
    );
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
    console.error("updateLeadRep:", err);
    return res.status(500).json({ success: false, message: "שגיאה בשרת" });
  }
}

/**
 * מחיקה לוגית (סימון 'בוטלה')
 * מקבל: :id
 */
export async function cancelLead(req, res) {
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
    console.error("cancelLead:", err);
    return res.status(500).json({ success: false, message: "שגיאה בשרת" });
  }
}

/**
 * עדכון סטטוס לפנייה
 * מקבל: :id, { status }
 */
export async function updateLeadStatus(req, res) {
  const leadId = req.params.id;
  const newStatus = String(req.body.status ?? "").trim();

  if (!isValidLeadStatus(newStatus)) {
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
    console.error("updateLeadStatus:", err);
    return res.status(500).json({ success: false, message: "שגיאה בשרת" });
  }
}

/**
 * שיוך מרוכז של פניות לנציג
 * מקבל: { leadIds: number[], user_id? } – אם user_id=null => הסרת שיוך
 */
export async function bulkAssign(req, res) {
  const { leadIds, user_id } = req.body;

  if (!Array.isArray(leadIds) || leadIds.length === 0) {
    return res.status(400).json({ success: false, message: "לא נבחרו פניות" });
  }

  const repUserId = user_id != null ? String(user_id).trim() : null;
  if (repUserId && !isNineDigitId(repUserId)) {
    return res.status(400).json({
      success: false,
      message: "תעודת זהות של הנציג חייב להיות מספר בן 9 ספרות",
    });
  }

  try {
    const [result] = await db.query(
      "UPDATE leads SET user_id = ? WHERE lead_id IN (?)",
      [repUserId || null, leadIds]
    );

    let repUserName = repUserId
      ? `${repUserId.first_name} ${repUserId.last_name}`
      : "ללא נציג";
    logAction(
      `שיוך ${leadIds.length} פניות לנציג ${repUserName ?? "ללא נציג"}`,
      req.user.user_id
    )(req, res, () => {});
    return res.json({
      success: true,
      message: "השיוך בוצע בהצלחה",
      data: { affected: result?.affectedRows ?? 0 },
    });
  } catch (err) {
    console.error("bulkAssign:", err);
    return res.status(500).json({ success: false, message: "שגיאה בשרת" });
  }
}

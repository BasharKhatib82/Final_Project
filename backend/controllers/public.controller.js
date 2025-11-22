// backend/controllers/public.controller.js

import { db } from "../utils/dbSingleton.js";
import { isILPhone10 } from "../utils/fieldValidators.js";
import { validateAndSanitizeEmail } from "../utils/validateAndSanitizeEmail.js";

/**
 * API ליצירת ליד מדף נחיתה ללא משתמש מחובר
 * מקבל: { phone_number, project_name, first_name?, last_name?, email?, city?, source? }
 */
export async function addLandingLead(req, res) {
  let {
    phone_number,
    project_name,
    first_name,
    last_name,
    email,
    city,
    source,
  } = req.body;

  phone_number = String(phone_number ?? "").trim();
  first_name = String(first_name ?? "").trim();
  last_name = String(last_name ?? "").trim();
  email = String(email ?? "").trim();
  city = String(city ?? "").trim();
  project_name = String(project_name ?? "").trim();
  source = String(source ?? "").trim() || "דף נחיתה";

  if (!phone_number || !project_name) {
    return res
      .status(400)
      .json({ success: false, message: "מספר טלפון וקורס הם שדות חובה" });
  }
  if (!isILPhone10(phone_number)) {
    return res
      .status(400)
      .json({ success: false, message: "מספר טלפון לא תקין" });
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

    // שליפת מזהה קורס לפי שם
    const [project] = await db.query(
      "SELECT project_id FROM projects WHERE project_name = ? LIMIT 1",
      [course]
    );

    if (!project.length) {
      return res.status(400).json({ success: false, message: "קורס לא נמצא" });
    }

    req.body.project_id = project[0].project_id;

    // יצירה/עדכון לקוח
    const [clientRows] = await conn.query(
      "SELECT phone_number FROM clients WHERE phone_number = ?",
      [phone_number]
    );

    if (clientRows.length === 0) {
      await conn.query(
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
      `INSERT INTO leads (phone_number, project_id, status, source)
       VALUES (?, ?, 'חדשה', ?)`,
      [phone_number, project_id, source]
    );

    if (insLead.affectedRows !== 1) throw new Error("שמירת פנייה נכשלה");

    await conn.commit();
    return res.json({ success: true, message: "הפנייה נשמרה בהצלחה" });
  } catch (err) {
    await conn.rollback();
    console.error("addLandingLead:", err);
    return res
      .status(500)
      .json({ success: false, message: err.message || "שגיאת שרת" });
  } finally {
    conn.release();
  }
}

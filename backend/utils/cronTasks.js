// backend\utils\cronTasks.js

import cron from "node-cron";
import checkMissingAttendance from "./checkMissingAttendance.js";
import { db } from "./dbSingleton.js";

/**
 * למערכת CRON מרכז משימות
 *   הערות:
 * 1) כל יום א'-ה' בדיקת נוכחות חסרה 23:00  (Asia/Jerusalem)
 * 2) כל שעה עגולה — ניקוי טוקני איפוס סיסמה שפג תוקפם.
 *
 * לא צריך לייצא כלום import באמצעות server.js קובץ זה נטען ב
 */

/* ============================
   1) בדיקת נוכחות יומית
   ============================ */
/**
 * לוח זמנים: "0 23 * * 0-4"
 *  דקה 0, שעה 23, כל יום, כל חודש, ימים 0–4 (ראשון–חמישי).
 * timezone: Asia/Jerusalem
 */
cron.schedule(
  "0 23 * * 0-4",
  async () => {
    console.log("מריץ בדיקת נוכחות חסרה (יומית)...");
    try {
      await checkMissingAttendance();
      console.log("בדיקת נוכחות הושלמה");
    } catch (err) {
      console.error("שגיאה בהרצת בדיקת נוכחות:", err);
    }
  },
  { scheduled: true, timezone: "Asia/Jerusalem" }
);

/* ============================
   2) ניקוי טוקני איפוס (שעתית)
   ============================ */
/**
 *  DB של ה NOW() : משתמש ב
 */
cron.schedule("0 * * * *", async () => {
  try {
    const [result] = await db.query(
      "DELETE FROM password_resets WHERE reset_expires < NOW()"
    );
    if (result?.affectedRows > 0) {
      console.log(`נמחקו ${result.affectedRows} טוקני איפוס שפג תוקפם`);
    }
  } catch (err) {
    console.error("שגיאה בניקוי טוקני איפוס:", err);
  }
});

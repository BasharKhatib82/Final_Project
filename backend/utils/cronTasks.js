import cron from "node-cron";
import checkMissingAttendance from "./checkMissingAttendance.js";

// כל יום ב־23:00 לפי שעון ישראל (ימים ראשון עד חמישי)
cron.schedule(
  "0 23 * * 0-4",
  async () => {
    console.log("⏰ מריץ בדיקת נוכחות חסרה...");
    try {
      await checkMissingAttendance();
      console.log("✅ בדיקת נוכחות הושלמה");
    } catch (err) {
      console.error("❌ שגיאה בהרצת בדיקת נוכחות:", err);
    }
  },
  {
    scheduled: true,
    timezone: "Asia/Jerusalem", // 🔑 לוודא שה־cron עובד לפי שעון ישראל
  }
);

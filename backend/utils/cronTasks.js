import cron from "node-cron";
import checkMissingAttendance from "./checkMissingAttendance.js";

// כל יום ב־23:00 בדיוק
// (בשפת cron: 0=Sunday, 1=Monday, ..., 6=Saturday)
cron.schedule("55 23 * * 0-4", () => {
  console.log("⏰ מריץ בדיקת נוכחות חסרה...");
  checkMissingAttendance();
});

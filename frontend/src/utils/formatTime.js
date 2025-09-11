// frontend/src/utils/formatTime.js

/**
 * קובץ: formatTime.js
 * --------------------
 * מטרת הקובץ: לספק פונקציית עזר שמקבלת ערך זמן בפורמטים שונים
 * "HH:MM" ומחזירה אותו בפורמט אחיד של  (שעות ודקות, 24 שעות).
 *
 * שימוש :
 * - או טיימסטמפ ISO, Date, מערכות שונות שומרות זמנים בפורמטים שונים : מחרוזת, .
 * - תאריכים/שעות עלולים "לזוז" לפי אזור זמן הדפדפן  JavaScript ב
 * - (Asia/Jerusalem) כאן אנחנו מוודאים תמיד שימוש באזור הזמן של ישראל .
 *
 * שימוש עיקרי: הצגת שעות במסכים, טפסים, דוחות ולוגים
 * בצורה אחידה וברורה למשתמש.
 */

/**
 * formatTime
 * ------------------------------------------------------
 * "HH:MM" ממיר ערך זמן לפורמט  (24 שעות).
 *
 * @param {string|number|Date} input - ערך זמן נתמך:
 *   - string: "HH:MM" או "HH:MM:SS" ( "HH:MM" יוחזר)
 *   - string:  (נחלץ ממנו את החלק של השעה) ISO פורמט
 *   - number: timestamp (שניות או מילי־שניות)
 *   - Date: אובייקט תאריך
 *
 * @returns {string} או "-" אם הקלט לא תקין "HH:MM" מחרוזת זמן בפורמט
 *
 * דוגמאות:
 * formatTime("14:30") → "14:30"
 * formatTime("14:30:59") → "14:30"
 * formatTime("2023-09-01T14:30:00Z") → "17:30" (לפי Asia/Jerusalem)
 * formatTime(new Date()) → "13:07"
 * formatTime(1693561800) → "13:30"
 */
export default function formatTime(input) {
  if (!input) return "-";

  // מחרוזת שעה פשוטה → נחזיר "HH:MM"
  if (typeof input === "string") {
    const hhmm = input.match(/^(\d{2}:\d{2})(?::\d{2})?$/);
    if (hhmm) return hhmm[1];

    // ISO עם שעה → נחלץ "HH:MM"
    const iso = input.match(/T(\d{2}:\d{2})(?::\d{2})?/);
    if (iso) return iso[1];
    // אחרת ננסה Date בהמשך
  }

  // משאר המקרים Date יצירת אובייקט
  let d;
  if (input instanceof Date) {
    d = input;
  } else if (typeof input === "number") {
    // אם הערך בשניות → המרה למילי־שניות
    const ts = input < 2e10 ? input * 1000 : input;
    d = new Date(ts);
  } else if (typeof input === "string") {
    d = new Date(input);
  } else {
    return "-";
  }
  if (Number.isNaN(d.getTime())) return "-";

  // עם אזור זמן ישראל , 24 שעות Intl.DateTimeFormat שימוש ב
  const dtf = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Jerusalem",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  // ניקוי תווי כיווניות נדירים שעלולים להופיע
  return dtf.format(d).replace(/[\u200E\u200F]/g, "");
}

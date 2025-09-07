// src/utils/formatTime.js

/**
 * "HH:MM" (24h) המרת ערך זמן לפורמט .
 * קלט נתמך: "HH:MM" | "HH:MM:SS" | ISO | Date | טיימסטמפ (שניות/מילי־שניות).
 * קלט לא תקין → "-".
 * @param {string|number|Date} input ערך זמן
 * @returns {string} "HH:MM" או "-"
 */
export function formatTime(input) {
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

  //  Date - ננרמל ל
  let d;
  if (input instanceof Date) {
    d = input;
  } else if (typeof input === "number") {
    const ts = input < 2e10 ? input * 1000 : input; //  שניות → מילי שניות
    d = new Date(ts);
  } else if (typeof input === "string") {
    d = new Date(input);
  } else {
    return "-";
  }
  if (Number.isNaN(d.getTime())) return "-";

  // פירמוט לפי אזור הזמן של ישראל, 24 שעות
  const dtf = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Jerusalem",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  // ניקוי תווי כיווניות נדירים שעלולים להופיע
  return dtf.format(d).replace(/[\u200E\u200F]/g, "");
}

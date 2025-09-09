// frontend\src\utils\formatDate.js

/**
 * "DD-MM-YYYY" ממיר תאריך לפורמט
 *  Asia/Jerusalem מבוצעת המרה טקסטואלית / אחרת פירמוט לפי "YYYY-MM-DD" אם הקלט הוא
 * @param {string|number|Date} input ערך תאריך
 * @returns {string} "DD-MM-YYYY" או ""
 */
export function formatDate(input) {
  if (!input) return "";

  // "YYYY-MM-DD" נקי → המרה טקסטואלית בלבד (ללא Date)
  if (typeof input === "string" && /^\d{4}-\d{2}-\d{2}$/.test(input)) {
    const [y, m, d] = input.split("-");
    return `${d}-${m}-${y}`;
  }

  // Date שאר המקרים > ננסה ליצור
  let d;
  if (input instanceof Date) {
    d = input;
  } else if (typeof input === "number") {
    // אם לא מילי שניות - נבצע המרה למילי שניות
    const ts = input < 2e10 ? input * 1000 : input;
    d = new Date(ts);
  } else if (typeof input === "string") {
    d = new Date(input);
  } else {
    return "";
  }
  if (Number.isNaN(d.getTime())) return "";

  // "פירמוט באזור הזמן של ישראל כדי למנוע "יום קודם
  const dtf = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Jerusalem",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  //  לכן נעביר למקפים - "DD/MM/YYYY"  — מחזיר en-GB
  return dtf.format(d).replace(/\//g, "-");
}

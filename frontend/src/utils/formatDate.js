// frontend/src/utils/formatDate.js

/**
 * קובץ: formatDate.js
 * --------------------
 * מטרת הקובץ: לספק פונקציית עזר שמקבלת תאריך בפורמטים שונים
 * "DD-MM-YYYY" ומחזירה אותו בפורמט אחיד של .
 *
 * שימוש :
 * - (Date, timestamp, string) במערכות שונות תאריכים נשמרים בפורמטים שונים .
 * - עלול להחזיר יום קודם בגלל הפרשי אזורי זמן Date שימוש ב JavaScript ב .
 * - (Asia/Jerusalem) לכן כאן יש המרה מפורשת לאזור הזמן של ישראל .
 *
 * שימוש עיקרי: הצגת תאריכים בטפסים, דוחות ורכיבים ויזואליים
 * בצורה אחידה וברורה למשתמש.
 */

/**
 * formatDate
 * ------------------------------------------------------
 * ממיר ערך תאריך (Date, מספר, או מחרוזת) לפורמט "DD-MM-YYYY".
 *
 * @param {string|number|Date} input - ערך תאריך בפורמט נתמך:
 *   - string: מבוצעת המרה טקסטואלית בלבד "YYYY-MM-DD" אם הפורמט הוא
 *   - string: Date פורמטים אחרים ננסה ליצור אובייקט
 *   - number: timestamp (שניות או מילי־שניות)
 *   - Date: אובייקט תאריך תקין
 * @returns {string}  במקרה של שגיאה "" /  "DD-MM-YYYY" מחרוזת תאריך בפורמט
 */
export default function formatDate(input) {
  if (!input) return "";

  //( Date ללא ) המרה ישירה "YYYY-MM-DD" מחרוזת נקייה  →
  if (typeof input === "string" && /^\d{4}-\d{2}-\d{2}$/.test(input)) {
    const [y, m, d] = input.split("-");
    return `${d}-${m}-${y}`;
  }

  // משאר המקרים Date יצירת
  let d;
  if (input instanceof Date) {
    d = input;
  } else if (typeof input === "number") {
    //  המרה משניות למילי שניות
    const ts = input < 2e10 ? input * 1000 : input;
    d = new Date(ts);
  } else if (typeof input === "string") {
    d = new Date(input);
  } else {
    return "";
  }
  if (Number.isNaN(d.getTime())) return "";

  // עם אזור זמן ישראל כדי למנוע סטיות יום Intl.DateTimeFormat שימוש ב
  const dtf = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Jerusalem",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  // "DD/MM/YYYY" מחזיר en-GB   →  - נחליף / ב
  return dtf.format(d).replace(/\//g, "-");
}

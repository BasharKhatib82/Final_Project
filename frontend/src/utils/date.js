import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

/**
 * פורמט שעה/תאריך לפי שעון ישראל
 * @param {string|Date} dateInput - מחרוזת תאריך או אובייקט Date
 * @param {string} format - פורמט להצגה (ברירת מחדל: DD/MM/YYYY HH:mm)
 * @returns {string} תאריך בפורמט ישראלי
 */
export function formatDateToIsrael(dateInput, format = "DD/MM/YYYY HH:mm") {
  if (!dateInput) return "";
  return dayjs.utc(dateInput).tz("Asia/Jerusalem").format(format);
}

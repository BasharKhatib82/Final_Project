// frontend/src/utils/date.js

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";

dayjs.extend(utc);
dayjs.extend(timezone);

/**
 * פורמט שעה/תאריך לפי שעון ישראל
 * @param {string|Date} dateInput - מחרוזת תאריך או אובייקט Date
 * @param {string} format - פורמט להצגה (ברירת מחדל: DD/MM/YYYY HH:mm)
 * @returns {string} תאריך בפורמט ישראלי
 */
export const formatIsraelDateTime = (isoDateStr) =>
  dayjs.utc(isoDateStr).tz("Asia/Jerusalem").format("DD.MM.YYYY, HH:mm");

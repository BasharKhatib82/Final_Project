// frontend/src/utils/date.js

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

/**
 * פורמט תאריך/שעה לפי אזור זמן ישראל
 * @param {string} dateStr
 * @returns {string} תאריך מפורמט
 */
export function formatDateToIsrael(dateStr) {
  if (!dateStr) return "";
  return dayjs.utc(dateStr).tz("Asia/Jerusalem").format("DD/MM/YYYY HH:mm");
}


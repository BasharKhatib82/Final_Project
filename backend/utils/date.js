// backend/utils/date.js

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";

dayjs.extend(utc);
dayjs.extend(timezone);

// פונקציה שמחזירה את הזמן הנוכחי בפורמט לוגים
export function nowIsraelFormatted() {
  return dayjs().tz("Asia/Jerusalem").format("YYYY-MM-DD HH:mm:ss");
}

// פונקציה שמחזירה את התאריך הנוכחי בלבד (לשימוש בהחתמות)
export function todayIsrael() {
  return dayjs().tz("Asia/Jerusalem").format("YYYY-MM-DD");
}

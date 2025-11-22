import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";

dayjs.extend(utc);
dayjs.extend(timezone);

const ISRAEL_TZ = "Asia/Jerusalem";

// מחזיר אובייקט של dayjs לפי שעון ישראל
export function nowIsrael() {
  return dayjs().tz(ISRAEL_TZ);
}

// מחזיר מחרוזת פורמט של תאריך לפי שעון ישראל
export function nowIsraelFormatted(format = "YYYY-MM-DD HH:mm:ss") {
  return dayjs().tz(ISRAEL_TZ).format(format);
}

// ממיר תאריך כלשהו לפורמט ישראל
export function toIsraelTime(date) {
  return dayjs(date).tz(ISRAEL_TZ);
}
// ממיר תאריך כלשהו לפורמט ישראל מחרוזת
export function toIsraelTimeFormatted(date, format = "YYYY-MM-DD HH:mm:ss") {
  return dayjs(date).tz(ISRAEL_TZ).format(format);
}

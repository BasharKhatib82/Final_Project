// backend\utils\passwordHelpers.js

import { randomBytes } from "crypto";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";

dayjs.extend(utc);
dayjs.extend(timezone);

/**
 * מחשב כמה ימים עברו מתאריך מסוים עד עכשיו
 * מקבל: תאריך
 * מחזיר: מספר שלם של ימים
 */
export function getDaysSince(dateLike) {
  const d = new Date(dateLike);
  if (Number.isNaN(d.getTime())) return 0;
  const ms = Date.now() - d.getTime();
  return Math.max(0, Math.floor(ms / (1000 * 60 * 60 * 24)));
}

/**
 * יוצר טוקן איפוס סיסמה עם תאריך תפוגה לפי שעון ישראל
 * נשמר בפורמט SQL תקני
 */
export function generateResetToken(ttlMs = 15 * 60 * 1000) {
  const token = randomBytes(32).toString("hex");

  const expiresIsrael = dayjs()
    .tz("Asia/Jerusalem")
    .add(ttlMs, "millisecond")
    .format("YYYY-MM-DD HH:mm:ss");

  return { token, expires: expiresIsrael };
}

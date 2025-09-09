// backend\utils\passwordHelpers.js

import { randomBytes } from "crypto";

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
 * יוצר טוקן אקראי לאיפוס סיסמה
 * מחזיר: { token, expires }
 */
export function generateResetToken(ttlMs = 15 * 60 * 1000) {
  const token = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + ttlMs);
  return { token, expires };
}

// backend\utils\passwordHelpers.js

import { randomBytes } from "crypto";

/**
 * מחשב כמה ימים עברו מתאריך מסוים עד עכשיו
 * מקבל: תאריך
 * מחזיר: מספר שלם של ימים
 */
export function getDaysSince(date) {
  return Math.floor(
    (Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24)
  );
}

/**
 * יוצר טוקן אקראי לאיפוס סיסמה
 * מחזיר: { token, expires }
 */
export function generateResetToken() {
  return {
    token: randomBytes(32).toString("hex"),
    expires: new Date(Date.now() + 1000 * 60 * 15), // 15 דקות קדימה
  };
}

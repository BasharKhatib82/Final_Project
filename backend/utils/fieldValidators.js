// backend\utils\fieldValidators.js

/**
 * מזהה בעל 9 ספרות (כולל אפסים )
 */
export const isNineDigitId = (v) => /^\d{9}$/.test(String(v ?? "").trim());

/**
 *  מספר טלפון  תקין: בדיוק 10 ספרות ומתחיל ב 05
 */
export const isILPhone10 = (v) => /^05\d{8}$/.test(String(v ?? "").trim());

/**
 * מספר שלם חיובי (>= 1)
 */
export const isPositiveInt = (v) => {
  const s = String(v ?? "").trim();
  return /^\d+$/.test(s) && Number(s) > 0;
};

/**
 *  trim מחרוזת לא ריקה אחרי
 */
export const isNonEmptyString = (s) =>
  typeof s === "string" && s.trim().length > 0;

/**
 *   מחזיר ספרות בלבד מהקלט (לניקוי טלפון/ת"ז)
 */
export const digitsOnly = (s) => String(s ?? "").replace(/\D+/g, "");

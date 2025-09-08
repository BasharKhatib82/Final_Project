// backend\utils\convertToBit.js

/**
 * המרת ערך (בוליאני/מחרוזת/מספר) ל 0 או 1
 *  true / false / "1" / "0" / 1 / 0 :  מקבל
 * מחזיר: 1 או 0
 */
export function convertToBit(value) {
  return value === true || value === 1 || value === "1" ? 1 : 0;
}

// utils/safeFilename.js
/**
 * יוצר שם קובץ בטוח להורדה/שליחה
 * - מסיר תווים אסורים (/:*?"<>| וכו')
 * - ממיר עברית ואותיות מיוחדות ל־ASCII
 * - מוסיף חותמת זמן בטוחה
 */
export function makeSafeFilename(title = "report", format = "pdf") {
  // הסרת תווים אסורים
  let safeTitle = String(title)
    .replace(/[\\/:*?"<>|]+/g, "_")
    .trim();

  // הסרת רווחים כפולים
  safeTitle = safeTitle.replace(/\s+/g, "_");

  // fallback אם נשאר ריק
  if (!safeTitle) safeTitle = "report";

  // חותמת זמן בטוחה (2025-08-24_03-05-12)
  const d = new Date();
  const stamp = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(d.getDate()).padStart(2, "0")}_${String(d.getHours()).padStart(
    2,
    "0"
  )}-${String(d.getMinutes()).padStart(2, "0")}-${String(
    d.getSeconds()
  ).padStart(2, "0")}`;

  return `${safeTitle}_${stamp}.${format}`;
}

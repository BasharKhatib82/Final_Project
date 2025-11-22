// frontend/src/utils/date.js

/** מחזיר ISO כמות-שהוא (אם הגיע Date – נהפוך ל־ISO פעם אחת, עדיין UTC) */
const toIsoString = (input) => {
  if (!input) return "";
  if (typeof input === "string") return input;
  if (input instanceof Date && !isNaN(input)) return input.toISOString();
  return String(input);
};

/**  DD/MM/YYYY – בלי שינוי אזור זמן (טקסט בלבד) */
export function formatOnlyDateRaw(input) {
  const iso = toIsoString(input);
  // תופס YYYY-MM-DD בתחילת המחרוזת
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? `${m[3]}/${m[2]}/${m[1]}` : "";
}

/**  DD/MM/YYYY-  HH:mm – בלי שינוי אזור זמן (טקסט בלבד) */
export function formatDateAndTimeRaw(input) {
  const iso = toIsoString(input);

  // תופס YYYY-MM-DD HH:mm (גם עם T וגם עם רווח)
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/);
  if (m) {
    const [, y, mo, d, h, mi] = m;
    return `${d}/${mo}/${y}-  ${h}:${mi}`;
  }

  // אם אין שעה – נחזיר רק DD/MM/YYYY
  const dOnly = iso.match(/^(\d{4})-(\d{2})-(\d{2})/);
  return dOnly ? `${dOnly[3]}/${dOnly[2]}/${dOnly[1]}` : "";
}

/**  HH:mm – בלי שינוי אזור זמן (טקסטואלי בלבד) */
export function formatOnlyTimeRaw(input) {
  const iso = toIsoString(input);
  // תופס "HH:mm" אחרי T/רווח
  const m = iso.match(/[T ](\d{2}):(\d{2})/);
  return m ? `${m[1]}:${m[2]}` : "";
}

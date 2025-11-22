// frontend/src/utils/date.js

/** מחזיר ISO כמות-שהוא (אם הגיע Date – נהפוך ל־ISO פעם אחת, עדיין UTC) */
const toIsoString = (input) => {
  if (!input) return "";
  if (typeof input === "string") return input;
  if (input instanceof Date && !isNaN(input)) return input.toISOString();
  return String(input);
};

/** 1) YYYY-MM-DD – בלי שינוי אזור זמן (טקסטואלי בלבד) */
export function formatOnlyDateRaw(input) {
  const iso = toIsoString(input);
  // תופס "YYYY-MM-DD" בתחילת המחרוזת
  const m = iso.match(/^(\d{4}-\d{2}-\d{2})/);
  return m ? m[1] : "";
}

/** 2) YYYY-MM-DD HH:mm – בלי שינוי אזור זמן (טקסטואלי בלבד) */
export function formatDateAndTimeRaw(input) {
  const iso = toIsoString(input);
  // תופס "YYYY-MM-DD" ועוד "HH:mm" אחרי T/רווח
  const m = iso.match(/^(\d{4}-\d{2}-\d{2})[T ](\d{2}):(\d{2})/);
  return m ? `${m[1]} ${m[2]}:${m[3]}` : formatOnlyDateRaw(input);
}

/** 3) HH:mm – בלי שינוי אזור זמן (טקסטואלי בלבד) */
export function formatOnlyTimeRaw(input) {
  const iso = toIsoString(input);
  // תופס "HH:mm" אחרי T/רווח
  const m = iso.match(/[T ](\d{2}):(\d{2})/);
  return m ? `${m[1]}:${m[2]}` : "";
}

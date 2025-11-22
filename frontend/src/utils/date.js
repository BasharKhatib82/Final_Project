// frontend/src/utils/date.js

// עוזר פנימי: מחלץ חלקי תאריך/זמן בשעון ישראל
function getILParts(dateInput) {
  const d = dateInput instanceof Date ? dateInput : new Date(dateInput);
  if (Number.isNaN(d.getTime())) return null;

  const parts = new Intl.DateTimeFormat("he-IL", {
    timeZone: "Asia/Jerusalem",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(d);

  const map = Object.fromEntries(parts.map((p) => [p.type, p.value]));
  // בחלק מסביבות אין hour/minute אם לא מבקשים—הוספנו למעלה
  return {
    year: map.year,
    month: map.month,
    day: map.day,
    hour: map.hour ?? "00",
    minute: map.minute ?? "00",
  };
}

/** 1) תאריך ישראלי + שעה: DD/MM/YYYY HH:mm */
export function formatIsraelDateTime(dateInput) {
  const p = getILParts(dateInput);
  return p ? `${p.day}/${p.month}/${p.year} ${p.hour}:${p.minute}` : "";
}

/** 3) רק שעה: HH:mm */
export function formatOnlyTime(dateInput) {
  const p = getILParts(dateInput);
  return p ? `${p.hour}:${p.minute}` : "";
}
/** 4) תאריך לפורמט ישראלי: DD/MM/YYYY */
export function formatDateToIsrael(dateInput) {
  const p = getILParts(dateInput);
  return p ? `${p.day}/${p.month}/${p.year}` : "";
}

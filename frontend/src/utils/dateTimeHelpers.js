// src/utils/dateHelpers.js

/**
 * Convert input into "DD-MM-YYYY" safely.
 * Supports:
 * - "YYYY-MM-DD" (kept as date-only, no timezone shift)
 * - ISO strings (e.g., "2025-09-06T00:00:00Z")
 * - Date objects
 * - timestamps (seconds or millis)
 */
export function formatDate(input) {
  if (!input) return "";

  // Case 1: pure SQL DATE -> transform textually to avoid TZ shifts
  if (typeof input === "string" && /^\d{4}-\d{2}-\d{2}$/.test(input)) {
    const [y, m, d] = input.split("-");
    return `${d}-${m}-${y}`;
  }

  // Parse other kinds into a Date
  let d;
  if (input instanceof Date) {
    d = input;
  } else if (typeof input === "number") {
    const ts = input < 2e10 ? input * 1000 : input; // seconds -> ms
    d = new Date(ts);
  } else if (typeof input === "string") {
    d = new Date(input);
  } else {
    return "";
  }
  if (Number.isNaN(d?.getTime())) return "";

  // Format in Asia/Jerusalem to avoid "previous day" issues
  const dtf = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Jerusalem",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  // en-GB returns "DD/MM/YYYY" -> convert to "DD-MM-YYYY"
  return dtf.format(d).replaceAll("/", "-");
}

/**
 * Convert input into "HH:MM" (24h).
 * Supports:
 * - "HH:MM" or "HH:MM:SS"
 * - ISO strings (e.g., "2025-09-06T08:15:00Z")
 * - Date objects
 * - timestamps (seconds or millis)
 */
export function formatTime(input) {
  if (!input) return "-";

  // Already "HH:MM" or "HH:MM:SS"
  if (typeof input === "string") {
    const hhmm = input.match(/^(\d{2}:\d{2})(?::\d{2})?$/);
    if (hhmm) return hhmm[1];

    // ISO -> extract by Date (below). If contains "T", skip to parsing.
  }

  // Normalize to Date
  let d;
  if (input instanceof Date) {
    d = input;
  } else if (typeof input === "number") {
    const ts = input < 2e10 ? input * 1000 : input; // seconds -> ms
    d = new Date(ts);
  } else if (typeof input === "string") {
    d = new Date(input);
  } else {
    return "-";
  }
  if (Number.isNaN(d?.getTime())) return "-";

  // Format strictly in Asia/Jerusalem (24h)
  const dtf = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Jerusalem",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  // Some locales add a leading zero-space; normalize to "HH:MM"
  return dtf.format(d).replace(/\u200E|\u200F/g, "");
}

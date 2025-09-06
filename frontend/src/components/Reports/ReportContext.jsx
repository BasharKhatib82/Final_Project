// src/components/Reports/ReportContext.jsx
import React, { createContext, useContext, useMemo, useState } from "react";

const ReportCtx = createContext(null);
export const useReport = () => useContext(ReportCtx);

export function ReportProvider({
  title = "דוח",
  columns = [],
  rows = [],
  filtersDef = [],
  searchableKeys = [],
  pageSize = 10,
  children,
  defaultFilters = {},
}) {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState(defaultFilters);
  const [page, setPage] = useState(1);

  const setFilter = (name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
    setPage(1);
  };

  const filteredRows = useMemo(() => {
    let data = [...rows];

    for (const f of filtersDef) {
      const v = filters[f.name];
      if (v == null || v === "" || (Array.isArray(v) && !v[0] && !v[1]))
        continue;

      if (f.type === "select") {
        data = data.filter((r) => String(r[f.name]) === String(v));
      } else if (f.type === "date") {
        // השוואה טקסטואלית "YYYY-MM-DD" → כולל קצה
        const target = dateOnlyFromValue(v);
        data = data.filter((r) => dateOnlyFromValue(r[f.name]) === target);
      } else if (f.type === "daterange" && Array.isArray(v)) {
        // השוואה טקסטואלית "YYYY-MM-DD" → כולל from/to
        const [fromRaw, toRaw] = v;
        const from = fromRaw ? dateOnlyFromValue(fromRaw) : "";
        const to = toRaw ? dateOnlyFromValue(toRaw) : "";

        data = data.filter((r) => {
          const rowDateStr = dateOnlyFromValue(r[f.name]);
          if (!rowDateStr) return false;
          if (from && rowDateStr < from) return false; // כולל from
          if (to && rowDateStr > to) return false; // כולל to
          return true;
        });
      } else if (f.type === "text") {
        data = data.filter((r) =>
          String(r[f.name] ?? "")
            .toLowerCase()
            .normalize("NFKC")
            .includes(String(v).toLowerCase().normalize("NFKC"))
        );
      }
    }

    // 🔎 חיפוש חופשי
    const term = (search || "").toLowerCase().trim().normalize("NFKC");
    if (term) {
      const keys = searchableKeys.length
        ? searchableKeys
        : columns.map((c) => c.key);
      data = data.filter((r) =>
        keys.some((k) =>
          String(r[k] ?? "")
            .toLowerCase()
            .normalize("NFKC")
            .includes(term)
        )
      );
    }

    return data;
  }, [rows, filters, filtersDef, search, searchableKeys, columns]);

  const total = filteredRows.length;
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, pages);
  const pageRows = filteredRows.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize
  );

  const value = {
    title,
    columns,
    rows,
    filtersDef,
    filters,
    setFilter,
    search,
    setSearch,
    page: safePage,
    setPage,
    pages,
    filteredRows,
    pageRows,
    total,
    pageSize,
  };

  return <ReportCtx.Provider value={value}>{children}</ReportCtx.Provider>;
}

/**
 * מחזיר תאריך כ־"YYYY-MM-DD" באופן יציב:
 * 1) אם זו מחרוזת שמתחילה ב־YYYY-MM-DD → לוקחים את החלק לפני ה־T (אם קיים).
 * 2) אם זה Date/מספר/מחרוזת אחרת → ממירים ל־Date ומשתמשים ב־UTC כדי להימנע מהסטות אזור זמן.
 * 3) אם לא ניתן לפרש → "".
 */
function dateOnlyFromValue(val) {
  try {
    if (typeof val === "string") {
      const match = val.match(/^(\d{4}-\d{2}-\d{2})(?:T.*)?$/);
      if (match) return match[1]; // לוקחים רק את YYYY-MM-DD
    }
    const d = val instanceof Date ? val : new Date(val);
    if (Number.isNaN(d.getTime())) return "";
    const y = d.getUTCFullYear();
    const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
    const dd = String(d.getUTCDate()).padStart(2, "0");
    return `${y}-${mm}-${dd}`;
  } catch {
    return "";
  }
}

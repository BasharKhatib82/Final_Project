import React, { createContext, useContext, useMemo, useState } from "react";

const ReportCtx = createContext(null);
export const useReport = () => useContext(ReportCtx);

/**
 * props:
 * - title, columns, rows
 * - filtersDef: [{ name, label, type: 'text'|'select'|'date'|'daterange', options? }]
 * - searchableKeys?: string[]
 * - pageSize?: number
 */
export function ReportProvider({
  title = "דוח",
  columns = [],
  rows = [],
  filtersDef = [],
  searchableKeys = [],
  pageSize = 20,
  children,
  defaultFilters = {},
}) {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ defaultFilters });
  const [page, setPage] = useState(1);

  const setFilter = (name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
    setPage(1);
  };

  const filteredRows = useMemo(() => {
    let data = [...rows];

    // סינון לפי filtersDef
    for (const f of filtersDef) {
      const v = filters[f.name];
      if (v == null || v === "" || (Array.isArray(v) && !v[0] && !v[1]))
        continue;

      if (f.type === "select") {
        data = data.filter((r) => String(r[f.name]) === String(v));
      } else if (f.type === "date") {
        data = data.filter((r) => formatDateOnly(r[f.name]) === v);
      } else if (f.type === "daterange" && Array.isArray(v)) {
        const [from, to] = v;
        data = data.filter((r) => {
          const d = formatDateOnly(r[f.name]); // "YYYY-MM-DD"
          const ge = from ? d >= from : true;
          const le = to ? d <= to : true;
          return ge && le;
        });
      } else if (f.type === "text") {
        data = data.filter((r) => String(r[f.name] ?? "").includes(v));
      }
    }

    // חיפוש חופשי
    const term = (search || "").toLowerCase().trim();
    if (term) {
      const keys = searchableKeys.length
        ? searchableKeys
        : columns.map((c) => c.key);
      data = data.filter((r) =>
        keys.some((k) =>
          String(r[k] ?? "")
            .toLowerCase()
            .includes(term)
        )
      );
    }

    return data;
  }, [rows, filters, filtersDef, search, searchableKeys, columns]);

  const total = filteredRows.length;
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const pageRows = filteredRows.slice((page - 1) * pageSize, page * pageSize);

  const value = {
    title,
    columns,
    rows,
    filtersDef,
    filters,
    setFilter,
    search,
    setSearch,
    page,
    setPage,
    pages,
    filteredRows,
    pageRows,
    total,
    pageSize,
  };

  return <ReportCtx.Provider value={value}>{children}</ReportCtx.Provider>;
}

/* helpers */
function formatDateOnly(val) {
  try {
    const d = new Date(val);
    if (isNaN(d)) return "";
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  } catch {
    return "";
  }
}

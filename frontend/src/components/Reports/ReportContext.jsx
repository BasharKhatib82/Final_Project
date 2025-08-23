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
  pageSize = 20,
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
        data = data.filter((r) => formatDateOnly(r[f.name]) === v);
      } else if (f.type === "daterange" && Array.isArray(v)) {
        const [fromRaw, toRaw] = v;
        const from = fromRaw ? new Date(fromRaw) : null;
        const to = toRaw ? new Date(toRaw) : null;

        data = data.filter((r) => {
          const d = new Date(r[f.name]);
          if (isNaN(d)) return false;
          const ge = from ? d >= from : true;
          const le = to ? d <= to : true;
          return ge && le;
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
  const safePage = Math.min(page, pages); // 🔒 אם עברנו עמוד מעל המותר
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

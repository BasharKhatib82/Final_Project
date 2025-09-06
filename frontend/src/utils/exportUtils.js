// frontend\src\utils\exportUtils.js
export const normalizeCell = (val, emptyDash = "-") => {
  if (val === null || val === undefined) return emptyDash;
  const s = String(val).trim();
  return s === "" ? emptyDash : s;
};

export const buildExportTable = (rows = [], columns = [], emptyDash = "-") => {
  const safeRows = Array.isArray(rows) ? rows : [];

  // מדלגים על עמודות שלא מיוצאות (למשל actions) או כאלה שכל ה-export שלהן null/undefined
  const exportableCols = columns.filter((col) => {
    if (typeof col.export !== "function") return col.key !== "actions";
    try {
      return safeRows.some((r) => {
        const v = col.export(r);
        return v !== null && v !== undefined;
      });
    } catch {
      return false;
    }
  });

  const headers = exportableCols.map((c) => c.label || c.key);

  const tableRows = safeRows.map((r) =>
    exportableCols.map((col) => {
      const value =
        typeof col.export === "function" ? col.export(r) : r[col.key];
      return normalizeCell(value, emptyDash);
    })
  );

  return { headers, rows: tableRows };
};

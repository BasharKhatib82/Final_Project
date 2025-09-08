// backend/utils/reports.generator.js
import ExcelJS from "exceljs";
import wkhtmltopdf from "wkhtmltopdf";
import wkhtmltopdfInstaller from "wkhtmltopdf-installer";
import fs from "fs";
import os from "os";
import path from "path";

wkhtmltopdf.command = wkhtmltopdfInstaller.path;

/* ======================
   פונקציות עזר פנימיות
   ====================== */

/**
 *  מנקה שם קובץ מתווים אסורים.
 * מקבל: s (string)
 * מחזיר: string מתאים לשם קובץ
 */
function sanitizeFilename(s) {
  if (!s || typeof s !== "string") return "report";
  return s.replace(/[\\/:*?"<>|]+/g, "_").trim() || "report";
}

/**
 * מחזיר חותמת זמן קצרה לשם הקובץ.
 * מקבל: —
 * מחזיר: "HH-MM DD-MM-YYYY"
 */
function stamp() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}-${mm} ${day}-${m}-${y}`;
}

/**
 * ממיר ערך לטקסט נוח לייצוא ( סימון לבוליאני v).
 * מקבל: v (any)
 * מחזיר: string
 */
function toExportValue(v) {
  if (typeof v === "boolean") return v ? "✔" : "✖";
  if (v == null) return "";
  return String(v);
}

/**
 * HTML : מקודד תווים מסוכנים לפני הזרקה ל
 * מקבל: s (string)
 * מחזיר: string בטוח ל-HTML
 */
function escapeHtml(s = "") {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/* ==========================
   יצוא לאקסל / ל-PDF
   ========================== */

/**
 * מהעמודות והשורות שנשלחו Excel יוצר קובץ  .
 * מה מקבל: { title, columns[], rows[] }
 *   columns: [{ key, header? | label?, width?, export?, exportLabel? | export(row)? }, ...]
 *   rows:    [{ key:value, ... }, ...]
 * מה מחזיר: { buffer, filename }
 */
export async function generateExcel({ title, columns, rows }) {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Report");

  // אופציונלי: גיליון מימין-לשמאל עבור עברית (אקסל תומך)
  ws.views = [{ rightToLeft: true }];

  // כותרת
  const titleRow = ws.addRow([String(title || "דוח")]);
  titleRow.font = { size: 14, bold: true };
  titleRow.alignment = { horizontal: "center", vertical: "middle" };
  ws.addRow([]);

  // סינון עמודות שלא מייצאים
  const exportableCols = (columns || []).filter(
    (c) => c?.key !== "actions" && c?.export !== false
  );

  // header וגם ב־ labelתמיכה גם ב־
  const headers = exportableCols.map((c) => c.header || c.label || c.key || "");
  const headerRow = ws.addRow(headers);
  headerRow.font = { bold: true };
  headerRow.alignment = { horizontal: "center", vertical: "middle" };

  // שורות נתונים
  (rows || []).forEach((r) => {
    const data = exportableCols.map((c) => {
      if (c.exportLabel) return r[c.exportLabel];
      if (typeof c.export === "function") return c.export(r);
      return toExportValue(r[c.key]);
    });
    const row = ws.addRow(data);
    row.alignment = { horizontal: "center", vertical: "middle" };
  });

  // התאמת רוחב עמודות
  ws.columns.forEach((col) => {
    let maxLength = 10;
    col.eachCell({ includeEmpty: true }, (cell) => {
      const val = cell.value ? cell.value.toString() : "";
      maxLength = Math.max(maxLength, val.length + 2);
    });
    col.width = Math.min(maxLength, 40);
    col.alignment = { horizontal: "center", vertical: "middle" };
  });

  const buffer = await wb.xlsx.writeBuffer();
  const filename = `${sanitizeFilename(title || "דוח")} ${stamp()}.xlsx`;
  return { buffer, filename };
}

/**
 * ושומר לקובץ זמני (RTL) עם טבלה מלאה PDF : יוצר קובץ
 * מה מקבל: { title, columns[], rows[] }
 *   columns: [{ key, header? | label?, export?, exportLabel? | export(row)? }, ...]
 * מה מחזיר: Promise<{ filePath, filename }>
 */
export async function generatePdf({ title, columns, rows }) {
  const exportableCols = (columns || []).filter(
    (c) => c?.key !== "actions" && c?.export !== false
  );

  // (header או label) כותרות
  const headersHtml = exportableCols
    .map((c) => `<th>${escapeHtml(c.header || c.label || c.key || "")}</th>`)
    .join("");

  // שורות
  const bodyHtml = (rows || [])
    .map((r) => {
      const cells = exportableCols
        .map((c) => {
          let val;
          if (c.exportLabel) val = r[c.exportLabel];
          else if (typeof c.export === "function") val = c.export(r);
          else val = toExportValue(r[c.key]);
          return `<td>${escapeHtml(val)}</td>`;
        })
        .join("");
      return `<tr>${cells}</tr>`;
    })
    .join("");

  //  מלא HTML
  const html = `
<!doctype html>
<html dir="rtl" lang="he">
<head>
<meta charset="utf-8"/>
<title>${escapeHtml(title || "דוח")}</title>
<style>
  body { font-family: Arial, sans-serif; direction: rtl; padding: 20px; font-size: 11px; color: #333; }
  h1 { font-size: 16px; text-align: center; color: #2c3e50; margin-bottom: 20px; }
  table { border-collapse: collapse; width: 100%; font-size: 10px; }
  th { background:#f2f2f2; font-weight: bold; padding: 8px; border: 1px solid #999; text-align: center; }
  td { padding: 6px; border: 1px solid #ccc; text-align: center; }
  tr:nth-child(even) td { background-color: #fafafa; }
</style>
</head>
<body>
  <h1>${escapeHtml(title || "דוח")}</h1>
  <table>
    <thead><tr>${headersHtml}</tr></thead>
    <tbody>${bodyHtml}</tbody>
  </table>
</body>
</html>`.trim();

  // יצירת קובץ זמני
  const filename = `${sanitizeFilename(title || "דוח")} ${stamp()}.pdf`;
  const filePath = path.join(os.tmpdir(), filename);

  return new Promise((resolve, reject) => {
    const stream = fs.createWriteStream(filePath);
    wkhtmltopdf(html, { encoding: "utf-8" }).pipe(stream);
    stream.on("finish", () => resolve({ filePath, filename }));
    stream.on("error", reject);
  });
}

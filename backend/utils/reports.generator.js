import ExcelJS from "exceljs";
import wkhtmltopdf from "wkhtmltopdf";
import wkhtmltopdfInstaller from "wkhtmltopdf-installer";
import fs from "fs";
import os from "os";
import path from "path";

wkhtmltopdf.command = wkhtmltopdfInstaller.path;

// --- פונקציות עזר ---
function sanitizeFilename(s) {
  if (!s || typeof s !== "string") return "report";
  return s.replace(/[\\/:*?"<>|]+/g, "_").trim() || "report";
}

function stamp() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}-${mm} ${day}-${m}-${y}`;
}

function toExportValue(v) {
  if (typeof v === "boolean") return v ? "✔" : "✖";
  if (v == null) return "";
  return String(v);
}

// ✅ Excel (כמו שהיה אצלך)
export async function generateExcel({ title, columns, rows }) {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Report");

  const titleRow = ws.addRow([title]);
  titleRow.font = { size: 14, bold: true };
  titleRow.alignment = { horizontal: "center", vertical: "middle" };
  ws.addRow([]);

  const exportableCols = columns.filter(
    (c) => c.key !== "actions" && c.export !== false
  );
  const headers = exportableCols.map((c) => c.label);
  const headerRow = ws.addRow(headers);
  headerRow.font = { bold: true };
  headerRow.alignment = { horizontal: "center", vertical: "middle" };

  rows.forEach((r) => {
    const data = exportableCols.map((c) => {
      let val;
      if (c.exportLabel) val = r[c.exportLabel];
      else if (typeof c.export === "function") val = c.export(r);
      else val = toExportValue(r[c.key]);
      return val;
    });
    const row = ws.addRow(data);
    row.alignment = { horizontal: "center", vertical: "middle" };
  });

  ws.columns.forEach((col) => {
    let maxLength = 10;
    col.eachCell({ includeEmpty: true }, (cell) => {
      const val = cell.value ? cell.value.toString() : "";
      maxLength = Math.max(maxLength, val.length + 2);
    });
    col.width = maxLength > 40 ? 40 : maxLength;
    col.alignment = { horizontal: "center", vertical: "middle" };
  });

  const buffer = await wb.xlsx.writeBuffer();
  const filename = `${sanitizeFilename(title)} ${stamp()}.xlsx`;
  return { buffer, filename };
}

// ✅ PDF (עם טבלה מלאה)
export async function generatePdf({ title, columns, rows }) {
  const exportableCols = columns.filter(
    (c) => c.key !== "actions" && c.export !== false
  );

  // בניית כותרות
  const headersHtml = exportableCols.map((c) => `<th>${c.label}</th>`).join("");

  // בניית שורות
  const bodyHtml = rows
    .map((r) => {
      const cells = exportableCols
        .map((c) => {
          let val;
          if (c.exportLabel) val = r[c.exportLabel];
          else if (typeof c.export === "function") val = c.export(r);
          else val = toExportValue(r[c.key]);
          return `<td>${val}</td>`;
        })
        .join("");
      return `<tr>${cells}</tr>`;
    })
    .join("");

  // HTML מלא
  const html = `
    <html dir="rtl" lang="he">
      <head>
        <meta charset="utf-8" />
        <style>
  body { 
    font-family: Arial, sans-serif; 
    direction: rtl; 
    padding: 20px; 
    font-size: 11px;
    color: #333;
  }

  h1 { 
    font-size: 16px; 
    text-align: center; 
    color: #2c3e50; 
    margin-bottom: 20px; 
  }

  table { 
    border-collapse: collapse; 
    width: 100%; 
    font-size: 10px;
  }

  th { 
    background-color: #f2f2f2;   /* 👈 אפור בהיר */
    font-weight: bold;
    padding: 8px;
    border: 1px solid #999;
    text-align: center;
  }

  td { 
    padding: 6px; 
    border: 1px solid #ccc; 
    text-align: center; 
  }

  tr:nth-child(even) td { 
    background-color: #fafafa;  /* 👈 לבן-אפור ממש עדין */
  }
</style>

      </head>
      <body>
        <h1>${title}</h1>
        <table>
          <thead><tr>${headersHtml}</tr></thead>
          <tbody>${bodyHtml}</tbody>
        </table>
      </body>
    </html>
  `;

  // יצירת קובץ
  const filename = `${sanitizeFilename(title)} ${stamp()}.pdf`;
  const filePath = path.join(os.tmpdir(), filename);

  return new Promise((resolve, reject) => {
    const stream = fs.createWriteStream(filePath);
    wkhtmltopdf(html, { encoding: "utf-8" }).pipe(stream);

    stream.on("finish", () => resolve({ filePath, filename }));
    stream.on("error", reject);
  });
}

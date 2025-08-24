// backend/utils/reports.generator.js
import ExcelJS from "exceljs";
import puppeteer from "puppeteer";
import fs from "fs";
import os from "os";
import path from "path";



function sanitizeFilename(s) {
  if (!s || typeof s !== "string") return "report";

  // מנקים תווים אסורים לחלוטין (Windows / Linux / Mac)
  let safe = s.replace(/[\\/:*?"<>|]+/g, "_").trim();

  // אם אחרי הניקוי יצא ריק – נחזיר את המקור כמו שהוא (גם אם בעברית),
  // אחרת ניפול ל-"report"
  if (!safe) safe = s.trim();

  return safe || "report";
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

// ✅ Excel
export async function generateExcel({ title, columns, rows }) {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Report");

  const titleRow = ws.addRow([(title)]);
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

      if (typeof val === "string") val = val;
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

// ✅ PDF
// --- PDF חדש עם Puppeteer ---
export async function generatePdf({ title, columns, rows, logoPath }) {
  const exportableCols = columns.filter(
    (c) => c.key !== "actions" && c.export !== false
  );

  // headers
  const headersHtml = exportableCols.map((c) => `<th>${c.label}</th>`).join("");

  // body rows
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

  // HTML content
  const html = `
    <html lang="he" dir="rtl">
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: "Arial", sans-serif; direction: rtl; }
        h1 { text-align: center; }
        table { border-collapse: collapse; width: 100%; margin-top: 20px; }
        th, td { border: 1px solid #000; padding: 6px; text-align: center; }
        th { background: #eee; }
        img.logo { max-width: 150px; display: block; margin: 0 auto 20px; }
      </style>
    </head>
    <body>
      ${logoPath ? `<img class="logo" src="file://${logoPath}">` : ""}
      <h1>${title}</h1>
      <table>
        <thead><tr>${headersHtml}</tr></thead>
        <tbody>${bodyHtml}</tbody>
      </table>
    </body>
    </html>
  `;

  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "networkidle0" });

  const filename = `${sanitizeFilename(title)} ${stamp()}.pdf`;
  const filePath = path.join(os.tmpdir(), filename);

  await page.pdf({ path: filePath, format: "A4", printBackground: true });
  await browser.close();

  return { filePath, filename };
}
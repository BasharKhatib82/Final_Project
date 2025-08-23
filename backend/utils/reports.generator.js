// backend/utils/reports.generator.js
import ExcelJS from "exceljs";
import PdfPrinter from "pdfmake";
import fs from "fs";
import os from "os";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function sanitizeFilename(s) {
  return (
    String(s)
      .replace(/[\\/:*?"<>|]+/g, "_")
      .trim() || "report"
  );
}

function stamp() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm} - ${day}/${m}/${y}`; // ✨ תבנית קריאה יותר
}

// ממיר ערך לשדה יצוא קריא
function toExportValue(v) {
  if (typeof v === "boolean") return v ? "✓" : "✗";
  if (v == null) return "";
  return String(v);
}

export async function generateExcel({ title, columns, rows }) {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Report");

  const titleRow = ws.addRow([title]);
  titleRow.font = { size: 14, bold: true };
  titleRow.alignment = { horizontal: "center", vertical: "middle" };
  ws.addRow([]);

  // כותרות
  const headers = columns
    .filter((c) => c.key !== "actions")
    .map((c) => c.label);
  const headerRow = ws.addRow(headers);
  headerRow.font = { bold: true };
  headerRow.alignment = { horizontal: "center", vertical: "middle" };

  // נתונים
  rows.forEach((r) => {
    const data = columns
      .filter((c) => c.key !== "actions")
      .map((c) => toExportValue(r[c.key]));
    const row = ws.addRow(data);
    row.alignment = { horizontal: "center", vertical: "middle" };
  });

  // רוחב עמודות
  columns.forEach((_c, i) => {
    const col = ws.getColumn(i + 1);
    col.width = 20;
    col.alignment = { horizontal: "center", vertical: "middle" };
  });

  const filename = `${sanitizeFilename(title)} ${stamp()}.xlsx`;
  const filePath = path.join(os.tmpdir(), filename);
  await wb.xlsx.writeFile(filePath);
  return { filePath, filename };
}

export async function generatePdf({ title, columns, rows }) {
  const fonts = {
    NotoSans: {
      normal: path.resolve(__dirname, "../fonts/NotoSansHebrew-Regular.ttf"),
      bold: path.resolve(__dirname, "../fonts/NotoSansHebrew-Bold.ttf"),
    },
  };
  const printer = new PdfPrinter(fonts);

  const colsForPdf = columns.filter((c) => c.key !== "actions");
  const body = [
    colsForPdf.map((c) => ({
      text: c.label,
      style: "tableHeader",
      alignment: "center",
    })),
    ...rows.map((r) =>
      colsForPdf.map((c) => ({
        text: toExportValue(r[c.key]),
        alignment: "center",
      }))
    ),
  ];

  const docDefinition = {
    content: [
      {
        text: title || "דוח",
        style: "header",
        alignment: "center",
        margin: [0, 0, 0, 10],
      },
      { table: { headerRows: 1, body }, layout: "lightHorizontalLines" },
    ],
    styles: {
      header: { fontSize: 16, bold: true },
      tableHeader: { bold: true, fillColor: "#eeeeee" },
    },
    defaultStyle: { font: "NotoSans" },
    pageMargins: [30, 30, 30, 30],
  };

  const filename = `${sanitizeFilename(title)} ${stamp()}.pdf`;
  const filePath = path.join(os.tmpdir(), filename);

  return new Promise((resolve, reject) => {
    const pdfDoc = printer.createPdfKitDocument(docDefinition);
    const stream = fs.createWriteStream(filePath);
    pdfDoc.pipe(stream);
    pdfDoc.end();
    stream.on("finish", () => resolve({ filePath, filename }));
    stream.on("error", reject);
  });
}

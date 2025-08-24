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
  return `${hh}-${mm} ${day}-${m}-${y}`;
}

function toExportValue(v) {
  if (typeof v === "boolean") return v ? "✓" : "✗";
  if (v == null) return "";
  return String(v);
}

/**
 * ✅ יצירת Excel – Buffer + filename
 */
export async function generateExcel({ title, columns, rows }) {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Report");

  // כותרת עליונה
  const titleRow = ws.addRow([title]);
  titleRow.font = { size: 14, bold: true };
  titleRow.alignment = { horizontal: "center", vertical: "middle" };
  ws.addRow([]);

  // כותרות טבלה
  const headers = columns
    .filter((c) => c.key !== "actions" && c.export !== false)
    .map((c) => c.label);

  const headerRow = ws.addRow(headers);
  headerRow.font = { bold: true };
  headerRow.alignment = { horizontal: "center", vertical: "middle" };

  // נתונים
  rows.forEach((r) => {
    const data = columns
      .filter((c) => c.key !== "actions" && c.export !== false)
      .map((c) =>
        typeof c.export === "function" ? c.export(r) : toExportValue(r[c.key])
      );
    const row = ws.addRow(data);
    row.alignment = { horizontal: "center", vertical: "middle" };
  });

  // ✨ התאמת רוחב עמודות לפי התוכן הארוך ביותר
  ws.columns.forEach((col) => {
    let maxLength = 10;
    col.eachCell({ includeEmpty: true }, (cell) => {
      const val = cell.value ? cell.value.toString() : "";
      maxLength = Math.max(maxLength, val.length + 2);
    });
    col.width = maxLength > 40 ? 40 : maxLength; // הגבלת מקסימום 40
    col.alignment = { horizontal: "center", vertical: "middle" };
  });

  const buffer = await wb.xlsx.writeBuffer();
  const filename = `${sanitizeFilename(title)} ${stamp()}.xlsx`;
  return { buffer, filename };
}

/**
 * ✅ יצירת PDF כקובץ זמני (pdfmake חייב stream)
 */
export async function generatePdf({ title, columns, rows }) {
  const fonts = {
    NotoSans: {
      normal: path.resolve(__dirname, "../fonts/NotoSansHebrew-Regular.ttf"),
      bold: path.resolve(__dirname, "../fonts/NotoSansHebrew-Bold.ttf"),
    },
  };
  const printer = new PdfPrinter(fonts);

  const exportableCols = columns.filter(
    (c) => c.key !== "actions" && c.export !== false
  );

  //pdf נתוני טבלה
  const body = [
    exportableCols.map((c) => ({
      text: c.label,
      style: "tableHeader",
      alignment: "center",
    })),
    ...rows.map((r) =>
      exportableCols.map((c) => {
        const val =
          typeof c.export === "function"
            ? c.export(r)
            : toExportValue(r[c.key]);
        return {
          text: val,
          alignment: "center",
          noWrap: false,
          maxWidth: 150,
        };
      })
    ),
  ];

  const colWidths = exportableCols.map(() => "auto");

  const docDefinition = {
    content: [
      {
        text: title || "דוח",
        style: "header",
        alignment: "center",
        margin: [0, 0, 0, 10],
      },
      {
        table: {
          headerRows: 1,
          widths: colWidths,
          body,
        },
        layout: "lightHorizontalLines",
      },
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

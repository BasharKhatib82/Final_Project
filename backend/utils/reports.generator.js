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

  // כותרות
  const exportableCols = columns.filter(
    (c) => c.key !== "actions" && c.export !== false
  );
  const headers = exportableCols.map((c) => c.label);
  const headerRow = ws.addRow(headers);
  headerRow.font = { bold: true };
  headerRow.alignment = { horizontal: "center", vertical: "middle" };

  // שורות
  rows.forEach((r) => {
    const data = exportableCols.map((c) => {
      if (c.exportLabel) return r[c.exportLabel];
      if (typeof c.export === "function") return c.export(r);
      return toExportValue(r[c.key]);
    });
    const row = ws.addRow(data);
    row.alignment = { horizontal: "center", vertical: "middle" };
  });

  // התאמת רוחב
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


// פונקציה שמתקנת טקסט רק אם יש בו עברית
function fixHebrew(text) {
  if (!text) return "";
  const hebrewRegex = /[\u0590-\u05FF]/; // טווח יוניקוד לאותיות עבריות
  if (!hebrewRegex.test(text)) return String(text); // לא עברית → תחזיר כרגיל

  return String(text)
    .split(" ")
    .reverse()
    .join(" "); // הפוך מילים
}


/**
 * ✅ יצירת PDF כקובץ זמני (תמיכה בעברית RTL)
 */
export async function generatePdf({ title, columns, rows }) {
  const fonts = {
    DejaVu: {
      normal: path.resolve(__dirname, "../fonts/DejaVuSans.ttf"),
      bold: path.resolve(__dirname, "../fonts/DejaVuSans-Bold.ttf"),
    },
  };
  const printer = new PdfPrinter(fonts);

  const exportableCols = columns.filter(
    (c) => c.key !== "actions" && c.export !== false
  );

  // כותרות טבלה
  const headerRow = exportableCols
    .map((c) => ({
      text: fixHebrew(c.label),
      style: "tableHeader",
      alignment: "center",
    }))
    .reverse();

  // שורות טבלה
  const bodyRows = rows.map((r) =>
    exportableCols
      .map((c) => {
        let val;
        if (c.exportLabel) val = r[c.exportLabel];
        else if (typeof c.export === "function") val = c.export(r);
        else val = toExportValue(r[c.key]);

        // טיפול ב־✓✗
        if (val === "✓") val = "✔";
        if (val === "✗") val = "✖";

        return {
          text: fixHebrew(String(val)),
          alignment: "center",
          noWrap: false,
          margin: [2, 2, 2, 2],
        };
      })
      .reverse()
  );

  const colWidths = exportableCols.map(() => "auto").reverse();

  const docDefinition = {
    content: [
      {
        text: fixHebrew(title || "דוח"),
        style: "header",
        alignment: "center",
        margin: [0, 0, 0, 10],
      },
      {
        table: {
          headerRows: 1,
          widths: colWidths,
          body: [headerRow, ...bodyRows],
        },
        layout: "lightHorizontalLines",
      },
    ],
    styles: {
      header: { fontSize: 14, bold: true },
      tableHeader: { bold: true, fillColor: "#eeeeee" },
    },
    defaultStyle: {
      font: "DejaVu",
      alignment: "right",
      fontSize: 9,
    },
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
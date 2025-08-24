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
 * ✅ יצירת Excel כ־Buffer (בלי לשמור לדיסק)
 */
export async function generateExcel({ title, columns, rows }) {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Report");

  ws.addRow([title]).font = { size: 14, bold: true };
  ws.addRow([]);

  const headers = columns
    .filter((c) => c.key !== "actions")
    .map((c) => c.label);
  ws.addRow(headers).font = { bold: true };

  rows.forEach((r) => {
    const data = columns
      .filter((c) => c.key !== "actions")
      .map((c) => toExportValue(r[c.key]));
    ws.addRow(data);
  });

  return await wb.xlsx.writeBuffer();
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

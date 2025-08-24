// backend/utils/reports.generator.js
import ExcelJS from "exceljs";
import PdfPrinter from "pdfmake";
import fs from "fs";
import os from "os";
import path from "path";
import fixHebrewText from "./fixHebrewText.js"; // 👈 ייבוא נכון

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
  if (typeof v === "boolean") return v ? "✔" : "✖";
  if (v == null) return "";
  return String(v);
}

// ✅ Excel
export async function generateExcel({ title, columns, rows }) {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Report");

  const titleRow = ws.addRow([fixHebrewText(title)]);
  titleRow.font = { size: 14, bold: true };
  titleRow.alignment = { horizontal: "center", vertical: "middle" };
  ws.addRow([]);

  const exportableCols = columns.filter(
    (c) => c.key !== "actions" && c.export !== false
  );
  const headers = exportableCols.map((c) => fixHebrewText(c.label));
  const headerRow = ws.addRow(headers);
  headerRow.font = { bold: true };
  headerRow.alignment = { horizontal: "center", vertical: "middle" };

  rows.forEach((r) => {
    const data = exportableCols.map((c) => {
      let val;
      if (c.exportLabel) val = r[c.exportLabel];
      else if (typeof c.export === "function") val = c.export(r);
      else val = toExportValue(r[c.key]);

      if (typeof val === "string") val = fixHebrewText(val);
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
export async function generatePdf({ title, columns, rows }) {
  const fonts = {
    DejaVuSans: {
      normal: path.resolve("public/fonts/DejaVuSans.ttf"),
      bold: path.resolve("public/fonts/DejaVuSans-Bold.ttf"),
    },
  };
  const printer = new PdfPrinter(fonts);

  const exportableCols = columns.filter(
    (c) => c.key !== "actions" && c.export !== false
  );

  const headerRow = exportableCols
    .map((c) => ({
      text: c.label,
      style: "tableHeader",
      alignment: "center",
    }))
    .reverse();

  const bodyRows = rows.map((r) =>
    exportableCols
      .map((c) => {
        let val;
        if (c.exportLabel) val = r[c.exportLabel];
        else if (typeof c.export === "function") val = c.export(r);
        else val = toExportValue(r[c.key]);

        if (typeof val === "string") val = fixHebrewText(val);

        return {
          text: val,
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
        text: fixHebrewText(title) || "דוח",
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
      header: { fontSize: 12, bold: true },
      tableHeader: { bold: true, fillColor: "#eeeeee" },
    },
    defaultStyle: {
      font: "DejaVuSans",
      alignment: "right",
      fontSize: 10,
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

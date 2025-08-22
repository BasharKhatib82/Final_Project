// utils/reports.mailer.js
import nodemailer from "nodemailer";
import ExcelJS from "exceljs";
import PdfPrinter from "pdfmake";
import fs from "fs";
import os from "os";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 465,
  secure: process.env.SMTP_SECURE === "true", // true: 465 (SSL), false: 587 (STARTTLS)
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// טיפ: לקרוא פעם אחת עם עליית השרת
export function verifySmtp() {
  transporter.verify((err, ok) => {
    if (err) console.error("SMTP verify failed:", err.message);
    else console.log("✅ SMTP server is ready to send emails");
  });
}

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
  const ss = String(d.getSeconds()).padStart(2, "0");
  return `${y}-${m}-${day}_${hh}-${mm}-${ss}`;
}

// ממיר ערך לשדה יצוא קריא
function toExportValue(v) {
  if (typeof v === "boolean") return v ? "✓" : "✗";
  if (v == null) return "";
  return String(v);
}

export async function sendReportEmail({
  title,
  columns,
  rows,
  to,
  format = "xlsx",
}) {
  if (!to) throw new Error("missing 'to'");

  const safeTitle = sanitizeFilename(title || "report");
  const filename = `${safeTitle}_${stamp()}.${format}`;
  const filePath = path.join(os.tmpdir(), filename);

  // נסנן מראש את עמודת "actions" ל-PDF וגם ל-Excel אם תרצה; לפי בקשתך:
  // Excel — לא מסננים (רק אם תרצה, הפוך ל-true). PDF — כן מסננים.
  const actionsIndex = columns.findIndex((c) => c.key === "actions");
  const colsForExcel = columns; // אי-סינון
  const colsForPdf =
    actionsIndex >= 0 ? columns.filter((c) => c.key !== "actions") : columns;

  try {
    if (format === "xlsx") {
      const wb = new ExcelJS.Workbook();
      const ws = wb.addWorksheet("Report");

      // כותרות
      const headers = colsForExcel.map((c) => c.label);
      const headerRow = ws.addRow(headers);
      headerRow.font = { bold: true };
      headerRow.alignment = { horizontal: "center", vertical: "middle" };

      // נתונים (מרכז)
      rows.forEach((r) => {
        const data = colsForExcel.map((c) => toExportValue(r[c.key]));
        const row = ws.addRow(data);
        row.alignment = { horizontal: "center", vertical: "middle" };
      });

      // רוחב + יישור עמודה (גיבוי)
      colsForExcel.forEach((_c, i) => {
        const col = ws.getColumn(i + 1);
        col.width = 22;
        col.alignment = { horizontal: "center", vertical: "middle" };
      });

      await wb.xlsx.writeFile(filePath);
    } else if (format === "pdf") {
      // pdfmake – עם Noto Sans Hebrew
      const fonts = {
        NotoSans: {
          normal: path.resolve(
            __dirname,
            "../fonts/NotoSansHebrew-Regular.ttf"
          ),
          bold: path.resolve(__dirname, "../fonts/NotoSansHebrew-Bold.ttf"),
        },
      };
      const printer = new PdfPrinter(fonts);

      const body = [
        // כותרות ללא "actions"
        colsForPdf.map((c) => ({
          text: c.label,
          style: "tableHeader",
          alignment: "center",
        })),
        // שורות
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
            margin: [0, 0, 0, 8],
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

      const pdfDoc = printer.createPdfKitDocument(docDefinition);
      const stream = fs.createWriteStream(filePath);
      pdfDoc.pipe(stream);
      pdfDoc.end();
      await new Promise((resolve, reject) => {
        stream.on("finish", resolve);
        stream.on("error", reject);
      });
    } else {
      throw new Error(`unsupported format: ${format}`);
    }

    await transporter.sendMail({
      from: `"מערכת CRM" <${process.env.SMTP_USER}>`,
      to,
      subject: `דוח: ${title}`,
      text: `מצורף הדוח "${title}" בפורמט ${format.toUpperCase()}.`,
      attachments: [{ filename, path: filePath }],
    });
  } finally {
    // ניקוי קובץ זמני
    fs.unlink(filePath, () => {});
  }
}
